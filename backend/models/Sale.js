const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // optional
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  quantity: { type: Number, required: true },
  totalPrice: Number,
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card'] },
  billNumber: { type: String, unique: true },
  customerName: String,
  customerPhone: String,
  notes: String,
  returned: { type: Boolean, default: false },
  returnReason: String,
}, { timestamps: true });

SaleSchema.index({ pharmacistId: 1, createdAt: -1 });
SaleSchema.index({ batchId: 1 });

module.exports = mongoose.model('Sale', SaleSchema);