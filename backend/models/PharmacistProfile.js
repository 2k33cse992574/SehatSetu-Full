// /models/PharmacistProfile.js
const mongoose = require('mongoose');

const PharmacistProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // 🔹 SECTION 1: Personal Information
    personal: {
      fullName: { type: String, required: true }, // as per license
      dob: { type: Date, required: true },
      gender: { type: String, enum: ['male', 'female', 'other'], required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true }, // verified phone
      address: {
        state: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
      },
      govtIdNumber: { type: String, required: true }, // Aadhaar/Passport
      profilePhoto: { type: String }, // Cloudinary URL
    },

    // 🔹 SECTION 2: Professional Information
    professional: {
      registrationNumber: { type: String, required: true }, // Pharmacy Council Reg. No.
      issuingCouncil: { type: String, required: true }, // e.g., "Punjab Pharmacy Council"
      expiryDate: { type: Date, required: true },
      qualification: { type: String, required: true }, // B.Pharm, D.Pharm
      yearOfPassing: { type: Number, required: true },
      college: { type: String, required: true },
      experienceYears: { type: Number, required: true },
      specialization: { type: String }, // e.g., "Clinical Pharmacy"
    },

    // 🔹 SECTION 3: Workplace / Pharmacy Details
    workplace: {
      pharmacyName: { type: String, required: true },
      type: {
        type: String,
        enum: ['Retail', 'Wholesale', 'Hospital', 'Online', 'Other'],
        required: true,
      },
      licenseNumber: { type: String, required: true }, // Drug License No.
      licenseExpiry: { type: Date, required: true },
      issuingAuthority: { type: String, required: true }, // e.g., "Drug Control Dept, Punjab"
      address: {
        state: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        fullAddress: { type: String, required: true },
      },
      gstNumber: { type: String },
      contactNumber: { type: String, required: true },
      email: { type: String },
    },

    // 🔹 SECTION 4: Document Uploads
    documents: {
      degreeCertificate: { type: String, required: true }, // URL
      registrationCertificate: { type: String, required: true }, // Pharmacy Council Cert
      drugLicenseCertificate: { type: String, required: true }, // Drug License
      idProof: { type: String, required: true }, // Aadhaar/Passport
      addressProof: { type: String, required: true }, // Utility bill, etc.
      additionalCertificates: [{ type: String }], // Optional URLs
    },

    // 🔹 SECTION 5: Declarations
    declaration: {
      isDeclarationTrue: { type: Boolean, default: false, required: true },
      agreedToTerms: { type: Boolean, default: false, required: true },
    },

    // 🔹 Status & Audit
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true,
    },
    submittedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PharmacistProfile', PharmacistProfileSchema);
