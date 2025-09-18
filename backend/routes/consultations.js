const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  create,
  join,
  end,
  getChat,
  sendChat,
  updateSummary
} = require('../controllers/consultationController');

// POST /api/consultations — Create new consultation
router.post('/', auth, roleAuth('patient'), create);

// POST /api/consultations/:id/join — Join call
router.post('/:id/join', auth, roleAuth('patient', 'doctor'), join);

// POST /api/consultations/:id/end — End consultation
router.post('/:id/end', auth, roleAuth('patient', 'doctor'), end);

// GET /api/consultations/:id/chat — Get chat history
router.get('/:id/chat', auth, roleAuth('patient', 'doctor'), getChat);

// POST /api/consultations/:id/chat — Send message
router.post('/:id/chat', auth, roleAuth('patient', 'doctor'), sendChat);

// 👇 NEW: Save consultation summary (doctor only)
router.put('/:id/summary', auth, roleAuth('doctor'), updateSummary); // ← This works now!

module.exports = router;