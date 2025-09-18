// controllers/medicineController.js

const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const Alert = require('../models/Alert'); // For refill reminders

// GET /api/medicines — Search all medicines (by name)
exports.getAll = async (req, res) => {
  const { name } = req.query;

  let query = {};
  if (name) {
    query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
  }

  const medicines = await Medicine.find(query)
    .populate('pharmacyId', 'name address location') // Populate pharmacy details
    .sort({ name: 1 });

  res.json(medicines);
};

// GET /api/medicines/:id — Get single medicine by ID
exports.getById = async (req, res) => {
  const medicine = await Medicine.findById(req.params.id)
    .populate('pharmacyId', 'name address');

  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  res.json(medicine);
};

// POST /api/medicines/check-availability — Find pharmacies with stock
exports.checkAvailability = async (req, res) => {
  const { name, quantity } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Medicine name is required' });
  }

  const minStock = quantity || 1; // Default to 1 if not provided

  const medicines = await Medicine.find({
    name: { $regex: name, $options: 'i' },
    stock: { $gte: minStock }
  })
    .populate('pharmacyId', 'name address location')
    .sort({ price: 1 }); // Show cheapest first

  res.json(medicines);
};

// POST /api/medicines/refill-reminder — Set reminder (creates an Alert)
exports.setRefillReminder = async (req, res) => {
  const { medicineId, reminderDate } = req.body;

  if (!medicineId || !reminderDate) {
    return res.status(400).json({ message: 'medicineId and reminderDate are required' });
  }

  // Validate medicine exists
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  // Create alert
  const alert = new Alert({
    patientId: req.user.id,
    type: 'refill',
    title: `Refill reminder: ${medicine.name}`,
    message: `It's time to refill ${medicine.name}. Stock low.`,
    dueDate: new Date(reminderDate),
    meta: { medicineId }
  });

  await alert.save();

  res.json({ message: 'Refill reminder set successfully' });
};