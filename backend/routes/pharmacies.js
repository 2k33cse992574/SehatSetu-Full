const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  getAll,
  getById,
  getMedicines,
  search,
  getMyPharmacy,
  updateMyPharmacy,
  uploadAvatar
} = require('../controllers/pharmacyController');

// 📍 Public (patients, doctors, admin can view pharmacies)
router.get('/', auth, roleAuth('patient', 'doctor', 'admin'), getAll);
router.get('/:id', auth, roleAuth('patient', 'doctor', 'admin'), getById);
router.get('/:id/medicines', auth, roleAuth('patient', 'doctor', 'admin'), getMedicines);
router.post('/search', auth, roleAuth('patient', 'doctor', 'admin'), search);

// 📍 Private (pharmacist manages their own profile/pharmacy)
router.get('/me', auth, roleAuth('pharmacist'), getMyPharmacy);
router.put('/me', auth, roleAuth('pharmacist'), updateMyPharmacy);
router.post('/me/avatar', auth, roleAuth('pharmacist'), uploadAvatar);

module.exports = router;
