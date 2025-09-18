const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  create,
  getAll,
  cancel,
  reschedule,
  updateStatus // 👈 This was missing!
} = require('../controllers/appointmentController');

router.post('/', auth, roleAuth('patient'), create);
router.get('/', auth, roleAuth('patient'), getAll);
router.delete('/:id', auth, roleAuth('patient'), cancel);
router.post('/:id/reschedule', auth, roleAuth('patient'), reschedule);

// 👇 NEW DOCTOR-ONLY ROUTE
router.put('/:id/status', auth, roleAuth('doctor'), updateStatus); // Now it works!

module.exports = router;