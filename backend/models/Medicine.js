// models/Medicine.js
const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  pharmacistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Who owns this medicine
  name: { 
    type: String, 
    required: true, 
    index: true 
  },
  manufacturer: String,
  strength: String, // e.g., "500mg"
  form: { 
    type: String, 
    enum: ['tablet', 'capsule', 'syrup', 'injection'] 
  },
  price: Number,
  category: String, // e.g., antibiotics, painkiller
}, { timestamps: true });

// Text index for searching medicines by name per pharmacist
MedicineSchema.index({ pharmacistId: 1, name: 'text' });

module.exports = mongoose.model('Medicine', MedicineSchema);
