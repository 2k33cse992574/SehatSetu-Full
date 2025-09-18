const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  dashboard,
  patients,
  consultations,
  prescriptions
} = require('../controllers/analyticsController');

router.get('/dashboard', auth, roleAuth('doctor'), dashboard);
router.get('/patients', auth, roleAuth('doctor'), patients);
router.get('/consultations', auth, roleAuth('doctor'), consultations);
router.get('/prescriptions', auth, roleAuth('doctor'), prescriptions);

module.exports = router;