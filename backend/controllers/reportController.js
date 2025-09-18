const MedicalReport = require('../models/MedicalReport');
const { uploadToCloudinary } = require('../utils/cloudinary');

// GET /api/reports/patient/:pid — All reports for patient (by doctor)
exports.getByPatient = async (req, res) => {
  const reports = await MedicalReport.find({
    patientId: req.params.pid,
    doctorId: req.user.id
  }).sort({ createdAt: -1 });

  res.json(reports);
};

// POST /api/reports/patient/:pid — Upload report
exports.upload = async (req, res) => {
  const { patientId, title, type, notes } = req.body;

  if (!req.file) return res.status(400).json({ message: 'File required' });

  const url = await uploadToCloudinary(req.file.buffer, 'reports');

  const report = new MedicalReport({
    patientId,
    doctorId: req.user.id,
    title,
    type,
    fileUrl: url,
    fileName: req.file.originalname,
    notes,
    uploadedBy: 'doctor',
  });

  await report.save();
  res.status(201).json(report);
};

// GET /api/reports/:id — Get single report
exports.getById = async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) return res.status(404).json({ message: 'Not found' });
  if (report.doctorId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(report);
};

// DELETE /api/reports/:id — Delete report
exports.delete = async (req, res) => {
  const report = await MedicalReport.findById(req.params.id);

  if (!report) return res.status(404).json({ message: 'Not found' });
  if (report.doctorId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await report.remove();
  res.json({ message: 'Deleted' });
};