// models/Payment.js

const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Fast lookup by patient
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true, // Razorpay order ID
  },
  paymentId: {
    type: String,
    default: null,
    index: true, // Razorpay payment ID (after success)
  },
  amount: {
    type: Number,
    required: true,
    min: 1, // Minimum ₹1
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v > 0;
      },
      message: 'Amount must be a positive integer (in paise)'
    }
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR'], // Razorpay only supports INR for Indian accounts
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true, // Critical for reporting & filtering
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  signature: {
    type: String,
    default: null,
    index: true, // For fraud detection
  },
  metadata: {
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    // You can add more custom fields later
  },
  paidAt: {
    type: Date,
    default: null,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
  refundReason: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically handles createdAt/updatedAt
});

// Index for fast search by user + status
PaymentSchema.index({ userId: 1, status: 1 });

// Index for admin reporting: status + date range
PaymentSchema.index({ status: 1, createdAt: -1 });

// Pre-save hook to update updatedAt
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);