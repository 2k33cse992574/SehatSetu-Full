const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  contact: String,
  phone: String,
  email: String,
  address: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

VendorSchema.index({ pharmacistId: 1, name: 1 });

module.exports = mongoose.model('Vendor', VendorSchema);