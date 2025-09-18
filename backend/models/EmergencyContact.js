const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  phone: String,
  relationship: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);