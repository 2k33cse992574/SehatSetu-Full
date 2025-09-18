const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  getAll,
  getById,
  update,
  getHistory
} = require('../controllers/patientController');

router.get('/', auth, roleAuth('doctor'), getAll);
router.get('/:id', auth, roleAuth('doctor'), getById);
router.put('/:id', auth, roleAuth('doctor'), update);
router.get('/:id/history', auth, roleAuth('doctor'), getHistory);

module.exports = router;