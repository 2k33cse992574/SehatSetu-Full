const PurchaseRequest = require('../models/PurchaseRequest');
const Vendor = require('../models/Vendor');
const Medicine = require('../models/Medicine');

// GET /api/purchases
exports.getAll = async (req, res) => {
  const purchases = await PurchaseRequest.find({ pharmacistId: req.user.id })
    .populate('vendorId', 'name contact')
    .populate('medicineId', 'name')
    .sort({ requestedAt: -1 });

  res.json(purchases);
};

// POST /api/purchases
exports.create = async (req, res) => {
  const { vendorId, medicineId, quantity, requestedPrice, notes } = req.body;

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) return res.status(404).json({ message: 'Medicine not found' });

  if (medicine.pharmacistId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const request = new PurchaseRequest({
    pharmacistId: req.user.id,
    vendorId,
    medicineId,
    quantity,
    requestedPrice,
    notes,
  });

  await request.save();
  res.status(201).json(request);
};

// PUT /api/purchases/:id
exports.update = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const request = await PurchaseRequest.findOneAndUpdate(
    { _id: id, pharmacistId: req.user.id },
    { status, notes, approvedAt: status === 'approved' ? new Date() : undefined },
    { new: true }
  );

  if (!request) return res.status(404).json({ message: 'Request not found' });

  res.json(request);
};

// DELETE /api/purchases/:id
exports.delete = async (req, res) => {
  const { id } = req.params;

  const request = await PurchaseRequest.findOneAndDelete({
    _id: id,
    pharmacistId: req.user.id
  });

  if (!request) return res.status(404).json({ message: 'Request not found' });

  res.json({ message: 'Request cancelled' });
};