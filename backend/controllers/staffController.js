const Staff = require('../models/staff');

// GET /api/staff — List all staff under this pharmacist
exports.getAll = async (req, res) => {
  const staff = await Staff.find({ pharmacistId: req.user.id })
    .sort({ name: 1 });

  res.json(staff);
};

// POST /api/staff — Add new staff
exports.create = async (req, res) => {
  const { name, phone, role } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required' });
  }

  const staff = new Staff({
    pharmacistId: req.user.id,
    name,
    phone,
    role,
  });

  await staff.save();
  res.status(201).json(staff);
};

// PUT /api/staff/:id — Update staff
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, phone, role, isActive } = req.body;

  const staff = await Staff.findOneAndUpdate(
    { _id: id, pharmacistId: req.user.id },
    { name, phone, role, isActive },
    { new: true }
  );

  if (!staff) {
    return res.status(404).json({ message: 'Staff not found or unauthorized' });
  }

  res.json(staff);
};

// DELETE /api/staff/:id — Delete staff
exports.delete = async (req, res) => {
  const { id } = req.params;

  const staff = await Staff.findOneAndDelete({
    _id: id,
    pharmacistId: req.user.id
  });

  if (!staff) {
    return res.status(404).json({ message: 'Staff not found or unauthorized' });
  }

  res.json({ message: 'Staff deleted' });
};