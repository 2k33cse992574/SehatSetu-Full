const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  pharmacistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ['cashier', 'inventory', 'manager'],
    default: 'cashier'
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

StaffSchema.index({ pharmacistId: 1, isActive: 1 });

module.exports = mongoose.model('Staff', StaffSchema);