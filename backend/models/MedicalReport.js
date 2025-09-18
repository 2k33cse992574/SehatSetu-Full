const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  type: { type: String, enum: ['lab-report', 'scan', 'xray', 'ecg', 'other'] },
  fileUrl: String, // Cloudinary URL
  fileName: String,
  uploadedBy: { type: String, enum: ['doctor', 'patient'], default: 'doctor' },
  notes: String,
}, { timestamps: true });

ReportSchema.index({ patientId: 1, doctorId: 1 });
ReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('MedicalReport', ReportSchema);