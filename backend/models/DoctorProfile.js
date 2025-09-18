// /models/DoctorProfile.js
const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // 🔹 1. Personal Information
    personal: {
      fullName: { type: String, required: true },
      dob: { type: Date },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      email: { type: String },
      phone: { type: String, required: true },
      address: {
        state: String,
        city: String,
        district: String,
        pincode: String,
      },
      profilePhoto: String, // Cloudinary URL
      governmentIdNumber: String,
    },

    // 🔹 2. Professional Information
    professional: {
      registrationNumber: { type: String, required: true }, // NMC/SMC Reg No.
      issuingCouncil: String,
      registrationValidity: Date,
      highestQualification: String,
      specialization: String,
      yearOfPassing: Number,
      collegeOrUniversity: String,
      yearsOfExperience: Number,
      currentRole: String,
      bio: String,
    },

    // 🔹 3. Clinic / Hospital Information
    clinic: {
      name: String,
      contactNumber: String,
      email: String,
      address: {
        full: String,
        city: String,
        state: String,
        pincode: String,
      },
      practiceType: {
        type: String,
        enum: ['Private Clinic', 'Hospital Attached', 'Online Only'],
      },
      gstNumber: String,
    },

    // 🔹 4. Availability & Consultation
    availability: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sun … 6=Sat
        startTime: String, // e.g. "09:00"
        endTime: String,   // e.g. "17:00"
        isBooked: { type: Boolean, default: false },
      },
    ],
    consultationFee: {
      inPerson: { type: Number, default: 0 },
      teleconsultation: { type: Number, default: 0 },
    },
    consultationModes: [
      { type: String, enum: ['In-person', 'Telemedicine', 'Both'] },
    ],

    // 🔹 5. Document Uploads
    documents: {
      degreeCertificate: String,
      registrationCertificate: String,
      governmentId: String,
      addressProof: String,
      additionalCertificates: [String],
    },

    // 🔹 6. Declarations & Agreement
    declaration: {
      isDeclarationTrue: { type: Boolean, default: false },
      consentTelemedicine: { type: Boolean, default: false },
      agreedToTerms: { type: Boolean, default: false },
    },

    // 🔹 Status & Workflow
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    submittedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorProfile', DoctorProfileSchema);
