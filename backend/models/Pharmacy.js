// models/Pharmacy.js
const mongoose = require('mongoose');

const PharmacySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      unique: true, 
      index: true 
    }, // link pharmacist account

    // Pharmacy Info
    name: { type: String, required: true },
    address: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    licenseUrl: String, // scanned license copy
    contactNumber: { type: String, required: true },

    // Location
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: '2dsphere',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pharmacy', PharmacySchema);
