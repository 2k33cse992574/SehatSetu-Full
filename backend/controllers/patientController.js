const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');

// GET /api/patients — List all patients assigned to this doctor
exports.getAll = async (req, res) => {
  // Find all appointments where doctor is assigned
  const appointments = await Appointment.find({
    doctorId: req.user.id,
    status: { $in: ['scheduled', 'completed'] }
  })
    .populate('patientId', 'name gender age phone avatar')
    .sort({ createdAt: -1 });

  const patients = appointments.map(a => a.patientId).filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  res.json(patients);
};

// GET /api/patients/:id — Get single patient details
exports.getById = async (req, res) => {
  const patient = await User.findById(req.params.id)
    .select('name gender age phone avatar medicalHistory familyMembers');

  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  // Check if this doctor has ever consulted this patient
  const appointment = await Appointment.findOne({
    patientId: req.params.id,
    doctorId: req.user.id
  });

  if (!appointment) {
    return res.status(403).json({ message: 'Not authorized to view this patient' });
  }

  res.json(patient);
};

// PUT /api/patients/:id — Add doctor note to patient profile
exports.update = async (req, res) => {
  const { notes } = req.body;

  if (!notes) {
    return res.status(400).json({ message: 'Notes required' });
  }

  const patient = await User.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  // Verify doctor-patient relationship
  const appointment = await Appointment.findOne({
    patientId: req.params.id,
    doctorId: req.user.id
  });

  if (!appointment) {
    return res.status(403).json({ message: 'Not authorized to edit this patient' });
  }

  // Push note to medical history
  patient.medicalHistory = patient.medicalHistory || [];
  patient.medicalHistory.push({
    type: 'doctor-note',
    source: 'doctor',
    sourceId: req.user.id,
    note: notes,
    timestamp: new Date(),
  });

  await patient.save();

  res.json({ message: 'Note added to patient history' });
};

// GET /api/patients/:id/history — Get all history (prescriptions, reports, notes)
exports.getHistory = async (req, res) => {
  const patientId = req.params.id;

  // Verify relationship
  const appointment = await Appointment.findOne({
    patientId,
    doctorId: req.user.id
  });

  if (!appointment) {
    return res.status(403).json({ message: 'Not authorized to view this patient' });
  }

  const records = await MedicalRecord.find({ patientId })
    .select('title type fileUrl uploadedBy createdAt')
    .sort({ createdAt: -1 });

  const prescriptions = await Prescription.find({ patientId })
    .select('medicines dosage instructions date status')
    .sort({ date: -1 });

  const reports = await MedicalReport.find({ patientId })
    .select('title fileUrl uploadedBy createdAt')
    .sort({ createdAt: -1 });

  const notes = await User.findById(patientId)
    .select('medicalHistory')
    .then(user => user?.medicalHistory?.filter(h => h.type === 'doctor-note'));

  res.json({
    records,
    prescriptions,
    reports,
    notes,
  });
};