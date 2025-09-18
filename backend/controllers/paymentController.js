// controllers/paymentController.js

const Payment = require('../models/Payment');
const { createPayment, verifyPayment } = require('../utils/razorpay');

// POST /api/payments/initiate — Create payment order
exports.initiate = async (req, res) => {
  const { amount, description, orderId } = req.body;

  // Validate inputs
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Valid amount is required' });
  }

  if (!description) {
    return res.status(400).json({ message: 'Description is required' });
  }

  try {
    // Create Razorpay order
    const razorpayOrder = await createPayment(amount, 'INR', {
      userId: req.user.id,
      description,
      orderId: orderId || Date.now().toString(), // optional custom ID
    });

    // Save to our DB
    const payment = new Payment({
      userId: req.user.id,
      orderId: razorpayOrder.id,
      amount,
      currency: 'INR',
      status: 'pending',
      description,
      metadata: {
        razorpay_order_id: razorpayOrder.id,
        razorpay_signature: '',
        razorpay_payment_id: '',
      },
    });

    await payment.save();

    res.json({
      success: true,
      order: razorpayOrder,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error('Razorpay Order Creation Failed:', error);
    res.status(500).json({ message: 'Failed to initiate payment', error: error.message });
  }
};

// POST /api/payments/confirm — Verify payment signature and mark as completed
exports.confirm = async (req, res) => {
  const { paymentId, orderId, paymentId: razorpayPaymentId, signature } = req.body;

  if (!orderId || !razorpayPaymentId || !signature) {
    return res.status(400).json({ message: 'Missing required fields: orderId, paymentId, signature' });
  }

  try {
    // Verify signature from Razorpay
    const isValid = await verifyPayment(razorpayPaymentId, orderId, signature);

    if (!isValid) {
      return res.status(400).json({ message: 'Payment verification failed. Possible fraud.' });
    }

    // Find payment by orderId
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        status: 'completed',
        paymentId: razorpayPaymentId,
        signature,
        paidAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      payment,
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: 'Server error during payment confirmation', error: error.message });
  }
};

// GET /api/payments/history — Get all payments by logged-in user
exports.history = async (req, res) => {
  const payments = await Payment.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .select('-metadata -__v');

  res.json(payments);
};

// GET /api/payments/methods — Return available payment methods (for frontend UI)
exports.methods = (req, res) => {
  res.json({
    methods: ['razorpay'],
    supportedCurrencies: ['INR'],
    minAmount: 1, // ₹1 minimum
    maxAmount: 500000, // ₹5,00,000 maximum (Razorpay limit for basic accounts)
  });
};

// POST /api/payments/refund — Initiate refund (admin-only or super-user)
exports.refund = async (req, res) => {
  // For MVP: Only admin can trigger refunds
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admin can initiate refunds' });
  }

  const { paymentId, amount, reason } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: 'paymentId is required' });
  }

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (payment.status !== 'completed') {
    return res.status(400).json({ message: 'Only completed payments can be refunded' });
  }

  // In real app: Use Razorpay Refund API here
  // For MVP: Simulate refund and log
  console.log(`🚨 REFUND INITIATED: ${paymentId} | Amount: ₹${amount} | Reason: ${reason}`);

  // Update status to "refunded"
  payment.status = 'refunded';
  payment.refundReason = reason;
  payment.refundedAt = new Date();
  await payment.save();

  res.json({
    message: 'Refund initiated (simulated). Check Razorpay dashboard for actual refund.',
    payment,
  });
};