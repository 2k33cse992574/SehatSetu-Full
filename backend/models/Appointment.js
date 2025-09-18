const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // "10:30"
  reason: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);