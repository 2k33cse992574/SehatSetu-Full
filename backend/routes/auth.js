const express = require('express');
const router = express.Router();
const { register, login, verifyOtp, resendOtp, logout, session } = require('../controllers/authController');
const auth = require('../middleware/auth'); // We'll create this next

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Protected routes
router.get('/session', auth, session); // <-- protected by JWT
router.post('/logout', auth, logout);

module.exports = router;