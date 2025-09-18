const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const protect = require('../middleware/auth'); // 👈 Import the default export

const {
  getMe,
  updateMe,
  uploadAvatar,
  getAvailability,
  setAvailability,
  submitOnboarding // 👈 Add this
} = require('../controllers/doctorController');

router.get('/me', auth, roleAuth('doctor'), getMe);
router.put('/me', auth, roleAuth('doctor'), updateMe);
router.post('/me/avatar', auth, roleAuth('doctor'), uploadAvatar);
router.get('/availability', auth, roleAuth('doctor'), getAvailability);
router.put('/availability', auth, roleAuth('doctor'), setAvailability);
router.post('/onboarding', protect, submitOnboarding); // 👈 New route

module.exports = router;