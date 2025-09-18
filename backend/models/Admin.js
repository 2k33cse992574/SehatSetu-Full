// models/Admin.js

const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true }, // bcrypt hash
  role: { type: String, enum: ['admin'], default: 'admin' },
  lastLogin: Date,
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);