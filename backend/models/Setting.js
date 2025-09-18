const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  autoCheckNMC: { type: Boolean, default: true },
  autoCheckPCI: { type: Boolean, default: false },
  requireSecondaryApproval: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure only one setting document
SettingSchema.index({ createdAt: 1 }, { unique: true });

module.exports = mongoose.model('Setting', SettingSchema);