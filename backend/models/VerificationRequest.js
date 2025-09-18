const mongoose = require('mongoose');

const VerificationRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Doctor', 'Pharmacist'],
    required: true,
  },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, index: true },
  specialization: String,
  education: String,
  experience: String,
  dob: Date,
  email: String,
  phone: String,
  photoUrl: String,
  documents: [{
    name: String,
    url: String,
    size: String,
    uploadedAt: Date,
  }],
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  notes: [{ type: String }],
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

VerificationRequestSchema.index({ type: 1, status: 1 });
VerificationRequestSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('VerificationRequest', VerificationRequestSchema);
