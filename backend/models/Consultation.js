const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: { type: String, enum: ['chat', 'audio', 'video'], required: true },
  callToken: String, // Twilio / WebRTC token for calls
  startedAt: Date,
  endedAt: Date,

  chatHistory: [
    {
      sender: { type: String, enum: ['patient', 'doctor'] },
      message: String,
      timestamp: { type: Date, default: Date.now },
      read: { type: Boolean, default: false }
    }
  ],

  summary: String, // doctor’s notes/diagnosis summary

  status: {
    type: String,
    enum: ['pending', 'active', 'ended'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', ConsultationSchema);
