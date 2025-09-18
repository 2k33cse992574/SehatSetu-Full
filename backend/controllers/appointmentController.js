const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');

// ============================
// Create Appointment
// POST /api/appointments
// ============================
exports.create = async (req, res) => {
  const { doctorId, date, time, reason } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

  const slotExists = doctor.availability.some(slot =>
    slot.dayOfWeek === new Date(date).getDay() &&
    slot.startTime === time &&
    !slot.isBooked
  );

  if (!slotExists) {
    return res.status(400).json({ message: 'Slot unavailable' });
  }

  // Mark slot as booked
  doctor.availability = doctor.availability.map(slot =>
    slot.dayOfWeek === new Date(date).getDay() && slot.startTime === time
      ? { ...slot, isBooked: true }
      : slot
  );
  await doctor.save();

  const appointment = new Appointment({
    patientId: req.user.id,
    doctorId,
    date,
    time,
    reason,
  });

  const savedApp = await appointment.save();
  res.status(201).json(savedApp);
};

// ============================
// Get All Appointments
// GET /api/appointments
// ============================
exports.getAll = async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.user.id })
    .populate('doctorId', 'userId specialty clinicName')
    .sort({ date: -1 });

  res.json(appointments);
};

// ============================
// Cancel Appointment
// DELETE /api/appointments/:id
// ============================
exports.cancel = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment || appointment.patientId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (appointment.status === 'completed') {
    return res.status(400).json({ message: 'Cannot cancel completed appointment' });
  }

  // Free up slot
  const doctor = await Doctor.findById(appointment.doctorId);
  const day = new Date(appointment.date).getDay();
  doctor.availability = doctor.availability.map(slot =>
    slot.dayOfWeek === day && slot.startTime === appointment.time
      ? { ...slot, isBooked: false }
      : slot
  );
  await doctor.save();

  appointment.status = 'cancelled';
  await appointment.save();

  res.json({ message: 'Appointment cancelled' });
};

// ============================
// Reschedule Appointment
// POST /api/appointments/:id/reschedule
// ============================
exports.reschedule = async (req, res) => {
  const { date, time } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment || appointment.patientId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (appointment.status !== 'scheduled') {
    return res.status(400).json({ message: 'Only scheduled appointments can be rescheduled' });
  }

  const doctor = await Doctor.findById(appointment.doctorId);
  const oldSlot = doctor.availability.find(
    s => s.dayOfWeek === new Date(appointment.date).getDay() && s.startTime === appointment.time
  );

  const newSlot = doctor.availability.find(
    s => s.dayOfWeek === new Date(date).getDay() && s.startTime === time && !s.isBooked
  );

  if (!newSlot) {
    return res.status(400).json({ message: 'New slot unavailable' });
  }

  // Free old, book new
  oldSlot.isBooked = false;
  newSlot.isBooked = true;
  await doctor.save();

  appointment.date = date;
  appointment.time = time;
  appointment.status = 'rescheduled';
  await appointment.save();

  res.json(appointment);
};

// ============================
// Update Appointment Status
// PUT /api/appointments/:id
// ============================
// controllers/appointmentController.js

// ... other functions ...

// PUT /api/appointments/:id/status — Doctor marks as completed/cancelled/rescheduled
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  if (appointment.doctorId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const validStatuses = ['completed', 'cancelled', 'rescheduled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  appointment.status = status;
  await appointment.save();

  // If completed, auto-close consultation
  if (status === 'completed' && appointment.consultationId) {
    await Consultation.findByIdAndUpdate(appointment.consultationId, { status: 'ended' });
  }

  res.json(appointment);
};
