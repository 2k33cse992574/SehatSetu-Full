const mongoose = require('mongoose');

const PurchaseRequestSchema = new mongoose.Schema({
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  batchNumber: String,
  quantity: { type: Number, required: true },
  requestedPrice: Number,
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'shipped', 'received'],
    default: 'requested'
  },
  notes: String,
  requestedAt: { type: Date, default: Date.now },
  approvedAt: Date,
}, { timestamps: true });

PurchaseRequestSchema.index({ pharmacistId: 1, status: 1 });
PurchaseRequestSchema.index({ vendorId: 1 });

module.exports = mongoose.model('PurchaseRequest', PurchaseRequestSchema);