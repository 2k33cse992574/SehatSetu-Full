const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['doctor', 'pharmacist'], // lowercase only
    required: true,
  },

  licenseNumber: { type: String },

  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'], // lowercase only
    default: 'pending',
    index: true,
  },

  rejectedReason: { type: String },
  notes: [{ type: String }],

  submittedAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

// Helpful indexes
verificationRequestSchema.index({ type: 1, status: 1 });
verificationRequestSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
