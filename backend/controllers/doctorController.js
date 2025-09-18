const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const { uploadToCloudinary } = require('../utils/cloudinary');

// ==============================
// @desc    Get logged-in doctor profile
// @route   GET /api/doctor/me
// @access  Private
// ==============================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-otp -otpExpires -password')
      .populate('doctorProfile', 'specialization experience bio clinicName clinicAddress avatar licenseUrl availability status');

    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (user.verificationStatus !== 'approved') {
      return res.status(403).json({
        message: 'Your account is pending approval by admin.',
        verificationStatus: user.verificationStatus,
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        age: user.age,
        medicalLicenceNo: user.medicalLicenceNo,
      },
      profile: user.doctorProfile,
    });
  } catch (err) {
    console.error('GetMe Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// @desc    Update personal info
// @route   PUT /api/doctor/me
// @access  Private
// ==============================
exports.updateMe = async (req, res) => {
  try {
    const allowedFields = ['name', 'gender', 'age'];
    const updates = Object.keys(req.body);
    const isValid = updates.every(update => allowedFields.includes(update));

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid fields' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      select: '-otp -otpExpires -password'
    });

    res.json(user);
  } catch (err) {
    console.error('UpdateMe Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// @desc    Upload profile picture
// @route   POST /api/doctor/me/avatar
// @access  Private
// ==============================
exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const url = await uploadToCloudinary(req.file.buffer, 'doctors/avatars');

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { avatar: url },
      { new: true, upsert: true }
    );

    res.json({ avatar: url, profile });
  } catch (err) {
    console.error('UploadAvatar Error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

// ==============================
// @desc    Get availability slots
// @route   GET /api/doctor/availability
// @access  Private
// ==============================
exports.getAvailability = async (req, res) => {
  try {
    const doctorProfile = await DoctorProfile.findOne({ userId: req.user.id }, 'availability');

    if (!doctorProfile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctorProfile.availability || []);
  } catch (err) {
    console.error('GetAvailability Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// @desc    Set availability slots
// @route   PUT /api/doctor/availability
// @access  Private
// ==============================
exports.setAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!Array.isArray(availability)) {
      return res.status(400).json({ message: 'Availability must be an array' });
    }

    const validDays = [0, 1, 2, 3, 4, 5, 6]; // Sun-Sat
    for (let slot of availability) {
      if (
        typeof slot.dayOfWeek !== 'number' ||
        !validDays.includes(slot.dayOfWeek) ||
        !slot.startTime ||
        !slot.endTime
      ) {
        return res.status(400).json({ message: 'Invalid slot format' });
      }
    }

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: req.user.id },
      { availability },
      { new: true, upsert: false }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(profile.availability);
  } catch (err) {
    console.error('SetAvailability Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==============================
// @desc    Submit Doctor Onboarding Form
// @route   POST /api/doctor/onboarding
// @access  Private
// ==============================
exports.submitOnboarding = async (req, res) => {
  try {
    const {
      personal,
      professional,
      clinic,
      availability,
      consultationFee,
      consultationModes,
      documents,
      declaration
    } = req.body;

    // ✅ Validate declarations
    if (
      !declaration?.isDeclarationTrue ||
      !declaration?.consentTelemedicine ||
      !declaration?.agreedToTerms
    ) {
      return res.status(400).json({ message: 'You must agree to all declarations and terms.' });
    }

    // ✅ Find or create DoctorProfile
    let profile = await DoctorProfile.findOne({ userId: req.user.id });

    if (!profile) {
      profile = new DoctorProfile({ userId: req.user.id });
    }

    // ✅ Update profile sections
    profile.personal = personal;
    profile.professional = professional;
    profile.clinic = clinic;
    profile.availability = availability;
    profile.consultationFee = consultationFee;
    profile.consultationModes = consultationModes;
    profile.documents = documents;
    profile.declaration = declaration;

    // ✅ Status & timestamp
    profile.status = 'pending';
    profile.submittedAt = Date.now();

    await profile.save();

    // ✅ Update User (mark onboarding complete)
    await User.findByIdAndUpdate(req.user.id, {
      onboardingCompleted: true,
    });

    res.status(201).json({
      message: 'Doctor onboarding submitted successfully. Awaiting admin approval.',
      profile
    });
  } catch (err) {
    console.error('Onboarding Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
