const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  medicines: [{
    name: String,
    strength: String,
    form: String,
    dosage: String, // e.g., "1 tablet twice daily"
    duration: Number, // days
    instructions: String,
  }],
  notes: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for fast lookup by patient or doctor
PrescriptionSchema.index({ patientId: 1, doctorId: 1 });
PrescriptionSchema.index({ date: -1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);