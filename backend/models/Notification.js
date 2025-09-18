const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'new-appointment',
      'appointment-reminder',
      'patient-message',
      'admin-message',
      'prescription-issued',
      'report-uploaded'
    ],
    required: true
  },
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  metadata: {}, // e.g., { appointmentId: "...", prescriptionId: "..." }
}, { timestamps: true });

NotificationSchema.index({ recipientId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);