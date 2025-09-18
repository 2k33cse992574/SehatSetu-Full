const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  create,
  getById,
  getByPatient,
  update,
  delete: deletePrescription
} = require('../controllers/prescriptionController');

router.post('/', auth, roleAuth('doctor'), create);
router.get('/:id', auth, roleAuth('doctor'), getById);
router.get('/patient/:pid', auth, roleAuth('doctor'), getByPatient);
router.put('/:id', auth, roleAuth('doctor'), update);
router.delete('/:id', auth, roleAuth('doctor'), deletePrescription);

module.exports = router;