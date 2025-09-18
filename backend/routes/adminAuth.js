const express = require('express');
const router = express.Router();

// 👇 YOU FORGOT THIS IMPORT!
const adminAuth = require('../middleware/adminAuth');

const {
  login,
  logout,
  session
} = require('../controllers/adminAuthController');

router.post('/login', login);
router.post('/logout', adminAuth, logout); // ✅ Now adminAuth is defined
router.get('/session', adminAuth, session);

module.exports = router;