const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['refill', 'follow-up', 'appointment', 'emergency'] },
  title: String,
  message: String,
  triggeredAt: Date,
  dueDate: Date,
  dismissed: { type: Boolean, default: false },
  metadata: {}, // e.g., { appointmentId: "...", medicineId: "..." }
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);