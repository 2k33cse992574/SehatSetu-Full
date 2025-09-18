const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['patient', 'doctor', 'pharmacist', 'admin'],
    required: true,
  },
  name: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  age: { type: Number },
  phone: {
    type: String,
    unique: true,   // ✅ automatically creates an index
    required: true,
    trim: true,
  },
  medicalLicenceNo: { type: String },   // doctor only
  pharmacyLicenceNo: { type: String },  // pharmacist only
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  password: { type: String },
  tokens: [{ token: String }],
  avatar: { type: String }, // Cloudinary URL
  familyMembers: [{
    name: { type: String, required: true },
    relationship: { 
      type: String, 
      enum: ['spouse', 'child', 'parent', 'sibling', 'other'] 
    },
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    phone: String,
    medicalConditions: [String],
  }],
}, { timestamps: true });

// ❌ No need for: UserSchema.index({ phone: 1 });

module.exports = mongoose.model('User', UserSchema);
