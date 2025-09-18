const Vendor = require('../models/Vendor');

// GET /api/vendors
exports.getAll = async (req, res) => {
  const vendors = await Vendor.find({ pharmacistId: req.user.id, isActive: true });
  res.json(vendors);
};

// POST /api/vendors
exports.create = async (req, res) => {
  const { name, contact, phone, email, address } = req.body;

  const vendor = new Vendor({
    pharmacistId: req.user.id,
    name,
    contact,
    phone,
    email,
    address,
  });

  await vendor.save();
  res.status(201).json(vendor);
};

// PUT /api/vendors/:id
exports.update = async (req, res) => {
  const { id } = req.params;
  const update = req.body;

  const vendor = await Vendor.findOneAndUpdate(
    { _id: id, pharmacistId: req.user.id },
    update,
    { new: true }
  );

  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

  res.json(vendor);
};

// DELETE /api/vendors/:id
exports.delete = async (req, res) => {
  const { id } = req.params;

  const vendor = await Vendor.findByIdAndUpdate(
    { _id: id, pharmacistId: req.user.id },
    { isActive: false },
    { new: true }
  );

  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

  res.json({ message: 'Vendor archived' });
};