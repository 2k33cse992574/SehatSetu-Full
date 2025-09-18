// controllers/pharmacyController.js
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const { uploadToCloudinary } = require('../utils/cloudinary');

// GET /api/pharmacies — List all pharmacies (with optional location filter)
exports.getAll = async (req, res) => {
  const { location } = req.query;
  let query = {};

  if (location) {
    const [lng, lat] = location.split(',').map(Number);
    query['location.coordinates'] = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: 5000, // 5km
      },
    };
  }

  const pharmacies = await Pharmacy.find(query)
    .populate('userId', 'name avatar verificationStatus')
    .sort({ name: 1 });

  res.json(pharmacies);
};

// GET /api/pharmacies/:id — Single pharmacy details
exports.getById = async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id)
    .populate('userId', 'name avatar verificationStatus');

  if (!pharmacy) return res.status(404).json({ message: 'Pharmacy not found' });
  res.json(pharmacy);
};

// GET /api/pharmacies/:id/medicines — Medicines from this pharmacy
exports.getMedicines = async (req, res) => {
  const medicines = await Medicine.find({ pharmacyId: req.params.id }).sort({ name: 1 });
  res.json(medicines);
};

// POST /api/pharmacies/search — Search pharmacies by name or location
exports.search = async (req, res) => {
  const { name, location } = req.body;
  let query = {};

  if (name) query.name = { $regex: name, $options: 'i' };
  if (location) {
    const [lng, lat] = location.split(',').map(Number);
    query['location.coordinates'] = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: 5000,
      },
    };
  }

  const pharmacies = await Pharmacy.find(query)
    .populate('userId', 'name avatar verificationStatus')
    .sort({ name: 1 });

  res.json(pharmacies);
};

// GET /api/pharmacies/me — pharmacist's own pharmacy profile
exports.getMyPharmacy = async (req, res) => {
  const pharmacy = await Pharmacy.findOne({ userId: req.user.id })
    .populate('userId', 'name phone gender age verificationStatus');

  if (!pharmacy) return res.status(404).json({ message: 'Pharmacy profile not found' });

  if (pharmacy.userId.verificationStatus !== 'approved') {
    return res.status(403).json({
      message: 'Your account is pending admin approval.',
      verificationStatus: pharmacy.userId.verificationStatus,
    });
  }

  res.json(pharmacy);
};

// PUT /api/pharmacies/me — update pharmacist/pharmacy info
exports.updateMyPharmacy = async (req, res) => {
  const allowedFields = ['name', 'address', 'licenseNumber', 'contactNumber', 'location'];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) updates[key] = req.body[key];
  });

  const pharmacy = await Pharmacy.findOneAndUpdate(
    { userId: req.user.id },
    updates,
    { new: true }
  );

  res.json(pharmacy);
};

// POST /api/pharmacies/me/avatar — upload pharmacist avatar
exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const url = await uploadToCloudinary(req.file.buffer, 'pharmacies/avatars');
    await User.findByIdAndUpdate(req.user.id, { avatar: url }, { new: true });
    res.json({ avatar: url });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
};
