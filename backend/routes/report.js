const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  getByPatient,
  upload,
  getById,
  delete: deleteReport
} = require('../controllers/reportController');

router.get('/patient/:pid', auth, roleAuth('doctor'), getByPatient);
router.post('/patient/:pid', auth, roleAuth('doctor'), upload);
router.get('/:id', auth, roleAuth('doctor'), getById);
router.delete('/:id', auth, roleAuth('doctor'), deleteReport);

module.exports = router;