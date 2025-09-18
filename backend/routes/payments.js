// routes/payments.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  initiate,
  confirm,
  history,
  methods,
  refund
} = require('../controllers/paymentController');

// POST /api/payments/initiate — Start payment process
router.post('/initiate', auth, roleAuth('patient'), initiate);

// POST /api/payments/confirm — Verify payment after successful transaction
router.post('/confirm', auth, roleAuth('patient'), confirm);

// GET /api/payments/history — List all payments by patient
router.get('/history', auth, roleAuth('patient'), history);

// GET /api/payments/methods — Get available payment options
router.get('/methods', auth, roleAuth('patient', 'admin'), methods);

// POST /api/payments/refund — Admin-only refund (use carefully!)
router.post('/refund', auth, roleAuth('admin'), refund);

module.exports = router;