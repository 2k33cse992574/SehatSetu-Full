const MedicalRecord = require('../models/MedicalRecord');
const { uploadToCloudinary } = require('../utils/cloudinary');

// POST /api/medical-records
exports.create = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File required' });

  const url = await uploadToCloudinary(req.file.buffer, 'medical-records');
  const record = new MedicalRecord({
    patientId: req.user.id,
    title: req.body.title,
    type: req.body.type,
    description: req.body.description,
    fileUrl: url,
    fileName: req.file.originalname,
    uploadedBy: 'patient',
  });

  await record.save();
  res.status(201).json(record);
};

// GET /api/medical-records
exports.getAll = async (req, res) => {
  const records = await MedicalRecord.find({ patientId: req.user.id }).sort({ createdAt: -1 });
  res.json(records);
};

// GET /api/medical-records/:id/download
exports.download = async (req, res) => {
  const record = await MedicalRecord.findById(req.params.id);
  if (!record || record.patientId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${record.fileName}"`);
  // In real app: fetch from Cloudinary and stream
  // For now, redirect
  res.redirect(record.fileUrl);
};

// POST /api/medical-records/share
exports.share = async (req, res) => {
  const { recordId, doctorId } = req.body;

  const record = await MedicalRecord.findById(recordId);
  if (!record || record.patientId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  record.sharedWith.push(doctorId);
  await record.save();

  res.json({ message: 'Shared successfully' });
};

// GET /api/medical-records/types
exports.getTypes = (req, res) => {
  res.json(['prescription', 'lab-report', 'scan', 'vaccination', 'other']);
};