const User = require('../models/User');
const { generateOTP, sendOTP } = require('../utils/otpGenerator');
const { generateToken } = require('../utils/jwt');

// Utility: normalize phone numbers (keep only digits)
const normalizePhone = (phone) => phone.replace(/\D/g, '');

// 🔹 Register User (Patient / Doctor / Pharmacist / Admin)
exports.register = async (req, res) => {
  try {
    const { role, name, gender, age, phone } = req.body;

    if (!role || !name || !phone) {
      return res.status(400).json({ message: 'Name, role, and phone are required' });
    }

    const allowedRoles = ['patient', 'doctor', 'pharmacist', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const normalizedPhone = normalizePhone(phone);

    // Check if user already exists
    let user = await User.findOne({ phone: normalizedPhone });
    if (user) {
      if (!user.isVerified) {
        // Allow re-registration if previous was unverified
        await User.deleteOne({ _id: user._id });
      } else {
        return res.status(400).json({ message: 'User already exists and is verified.' });
      }
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newUser = new User({
      role,
      name,
      gender,
      age,
      phone: normalizedPhone,
      otp,
      otpExpires,
      isVerified: false,           // Will be set to true after OTP verification
      verificationStatus: 'pending', // Always "pending" until admin approves (only matters for doc/pharma)
      onboardingCompleted: false,
    });

    await newUser.save();
    await sendOTP(normalizedPhone, otp);

    res.status(201).json({
      message: 'Registration successful. OTP sent to your phone.',
      userId: newUser._id,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Login (send OTP) — same logic as register, but for existing users
exports.login = async (req, res) => {
  try {
    const { phone, role } = req.body;

    if (!phone || !role) {
      return res.status(400).json({ message: 'Phone and role required' });
    }

    const allowedRoles = ['patient', 'doctor', 'pharmacist', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await User.findOne({ phone: normalizedPhone });

    if (!user || user.role !== role) {
      return res.status(404).json({
        message: `You haven't registered as a ${role} yet. Please register first.`,
        shouldRegister: true,
      });
    }

    // If user is doctor/pharmacist and not approved → block login
    if ((role === 'doctor' || role === 'pharmacist') && user.verificationStatus !== 'approved') {
      return res.status(403).json({
        message: 'Your account is pending admin approval. Please wait for confirmation.',
      });
    }

    // Generate new OTP for login
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOTP(normalizedPhone, otp);

    res.status(200).json({ message: 'OTP sent to your phone' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Verify OTP (for both registration & login)
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp, isRegistration } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP required' });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await User.findOne({
      phone: normalizedPhone,
      otp,
      otpExpires: { $gt: Date.now() }, // OTP still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // ✅ STRICT RULE: Only allow bypass of admin approval if isRegistration === true
    // If isRegistration is missing, false, or anything else → treat as LOGIN → enforce approval
    if (isRegistration !== true) {
      // This is a LOGIN attempt — enforce admin approval for professionals
      if (['doctor', 'pharmacist'].includes(user.role)) {
        if (user.verificationStatus === 'pending') {
          return res.status(403).json({
            message: 'Account not verified by admin yet. Please wait for confirmation.',
          });
        }
        if (user.verificationStatus === 'rejected') {
          return res.status(403).json({
            message: 'Your account verification was rejected. Contact support.',
          });
        }
      }
      // 👇 PATIENTS ARE ALWAYS ALLOWED — NO ADMIN CHECK NEEDED
      // Even if verificationStatus is "pending", patient can log in
    }

    // ✅ Mark as verified (regardless of role or flow)
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        verificationStatus: user.verificationStatus,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone required' });

    const normalizedPhone = normalizePhone(phone);
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOTP(normalizedPhone, otp);

    res.status(200).json({ message: 'New OTP sent' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 Logout
exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// 🔹 Check session
exports.session = (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  res.status(200).json({
    isAuthenticated: true,
    user: {
      id: req.user.id,
      role: req.user.role,
      isVerified: req.user.isVerified,
      verificationStatus: req.user.verificationStatus,
    },
  });
};