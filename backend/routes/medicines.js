// routes/medicines.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  getAll,
  getById,
  checkAvailability,
  setRefillReminder
} = require('../controllers/medicineController'); // ← This MUST match controller exports

// GET /api/medicines — Search all medicines
router.get('/', auth, roleAuth('patient', 'doctor', 'admin'), getAll);

// GET /api/medicines/:id — Get single medicine
router.get('/:id', auth, roleAuth('patient', 'doctor', 'admin'), getById);

// POST /api/medicines/check-availability — Check stock across pharmacies
router.post('/check-availability', auth, roleAuth('patient', 'doctor', 'admin'), checkAvailability);

// POST /api/medicines/refill-reminder — Set refill alert
router.post('/refill-reminder', auth, roleAuth('patient'), setRefillReminder);

module.exports = router;