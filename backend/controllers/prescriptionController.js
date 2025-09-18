const Prescription = require('../models/Prescription');

// POST /api/prescriptions — Create prescription
exports.create = async (req, res) => {
  const { patientId, consultationId, medicines, notes } = req.body;

  // Verify doctor-patient relationship
  const appointment = await Appointment.findOne({
    patientId,
    doctorId: req.user.id,
    status: 'completed'
  });

  if (!appointment) {
    return res.status(403).json({ message: 'Cannot issue prescription without completed consultation' });
  }

  const prescription = new Prescription({
    doctorId: req.user.id,
    patientId,
    consultationId,
    medicines,
    notes,
  });

  await prescription.save();
  res.status(201).json(prescription);
};

// GET /api/prescriptions/:id — Get one prescription
exports.getById = async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) return res.status(404).json({ message: 'Not found' });
  if (prescription.doctorId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(prescription);
};

// GET /api/prescriptions/patient/:pid — Get all for patient
exports.getByPatient = async (req, res) => {
  const prescriptions = await Prescription.find({
    patientId: req.params.pid,
    doctorId: req.user.id
  })
    .sort({ date: -1 });

  res.json(prescriptions);
};

// PUT /api/prescriptions/:id — Update (e.g., change dosage)
exports.update = async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) return res.status(404).json({ message: 'Not found' });
  if (prescription.doctorId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const updates = req.body;
  const allowedUpdates = ['medicines', 'notes', 'status'];

  const isValid = Object.keys(updates).every(k => allowedUpdates.includes(k));
  if (!isValid) return res.status(400).json({ message: 'Invalid fields' });

  Object.assign(prescription, updates);
  await prescription.save();

  res.json(prescription);
};

// DELETE /api/prescriptions/:id — Cancel prescription
exports.delete = async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) return res.status(404).json({ message: 'Not found' });
  if (prescription.doctorId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  prescription.status = 'cancelled';
  await prescription.save();

  res.json({ message: 'Prescription cancelled' });
};