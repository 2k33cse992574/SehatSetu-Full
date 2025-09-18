// routes/pharmacistOnboardingRoutes.js
const express = require('express');
const protect = require('../middleware/auth'); // ✅ FIXED — no { }
const { submitOnboarding } = require('../controllers/pharmacistOnboardingController');

const router = express.Router();

router.post('/onboarding', protect, submitOnboarding);

module.exports = router;