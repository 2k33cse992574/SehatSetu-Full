const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPayment = async (amount, currency = 'INR', notes = {}) => {
  return new Promise((resolve, reject) => {
    razorpay.orders.create({
      amount: amount * 100, // paise
      currency,
      receipt: `rec_${Date.now()}`,
      notes,
    }, (err, order) => {
      if (err) return reject(err);
      resolve(order);
    });
  });
};

const verifyPayment = async (paymentId, orderId, signature) => {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(`${orderId}|${paymentId}`);
  const generatedSignature = hmac.digest('hex');

  return generatedSignature === signature;
};

module.exports = { createPayment, verifyPayment };