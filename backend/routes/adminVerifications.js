const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// 👇 YOU FORGOT TO IMPORT 'stats' HERE!
const {
  getAll,
  getById,
  verify,
  reject,
  stats // ← This is the missing piece!
} = require('../controllers/adminVerificationController');

router.get('/', adminAuth, getAll);
router.get('/:id', adminAuth, getById);
router.post('/:id/verify', adminAuth, verify);
router.post('/:id/reject', adminAuth, reject);
router.get('/stats', adminAuth, stats); // ✅ Now it works!

module.exports = router;