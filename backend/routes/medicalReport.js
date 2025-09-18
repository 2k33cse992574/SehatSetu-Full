const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  sales,
  stock,
  expiry,
  purchases
} = require('../controllers/medicalReportController');

router.get('/sales', auth, roleAuth('pharmacist'), sales);
router.get('/stock', auth, roleAuth('pharmacist'), stock);
router.get('/expiry', auth, roleAuth('pharmacist'), expiry);
router.get('/purchases', auth, roleAuth('pharmacist'), purchases);

module.exports = router;