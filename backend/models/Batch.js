const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
    index: true,
  },
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  batchNumber: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date, required: true },
  purchasePrice: Number,
  sellingPrice: Number,
  receivedAt: Date,
  status: {
    type: String,
    enum: ['active', 'expired', 'sold', 'damaged'],
    default: 'active'
  },
}, { timestamps: true });

BatchSchema.index({ pharmacistId: 1, expiryDate: 1 });
BatchSchema.index({ pharmacistId: 1, status: 1 });

module.exports = mongoose.model('Batch', BatchSchema);