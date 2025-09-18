const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');

// POST /api/medicines/:id/batches — Add new batch
exports.create = async (req, res) => {
  const { medicineId } = req.params;
  const { batchNumber, quantity, expiryDate, purchasePrice, sellingPrice } = req.body;

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
  if (medicine.pharmacistId.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const batch = new Batch({
    medicineId,
    pharmacistId: req.user.id,
    batchNumber,
    quantity,
    expiryDate,
    purchasePrice,
    sellingPrice,
    receivedAt: new Date(),
  });

  await batch.save();
  res.status(201).json(batch);
};

// PUT /api/medicines/:id/batches/:bid — Update batch (e.g., reduce stock after sale)
exports.update = async (req, res) => {
  const { medicineId, bid } = req.params;
  const { quantity, status } = req.body;

  const batch = await Batch.findOne({
    _id: bid,
    medicineId,
    pharmacistId: req.user.id
  });

  if (!batch) return res.status(404).json({ message: 'Batch not found' });

  if (quantity !== undefined) batch.quantity = quantity;
  if (status !== undefined) batch.status = status;

  await batch.save();
  res.json(batch);
};

// DELETE /api/medicines/:id/batches/:bid — Mark as damaged/removed
exports.delete = async (req, res) => {
  const { medicineId, bid } = req.params;

  const batch = await Batch.findOneAndUpdate(
    {
      _id: bid,
      medicineId,
      pharmacistId: req.user.id
    },
    { status: 'damaged' },
    { new: true }
  );

  if (!batch) return res.status(404).json({ message: 'Batch not found' });

  res.json({ message: 'Batch marked as damaged' });
};