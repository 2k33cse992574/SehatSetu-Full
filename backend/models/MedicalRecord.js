const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  type: { type: String, enum: ['prescription', 'lab-report', 'scan', 'vaccination', 'other'] },
  description: String,
  fileUrl: String, // Cloudinary URL
  fileName: String,
  uploadedBy: { type: String, enum: ['patient', 'doctor'] },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  blockchainHash: String, // SHA256 hash stored on side-chain later
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);