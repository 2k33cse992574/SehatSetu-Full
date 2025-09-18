const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  getAll,
  create,
  update,
  delete: deleteVendor
} = require('../controllers/vendorController');

router.get('/', auth, roleAuth('pharmacist'), getAll);
router.post('/', auth, roleAuth('pharmacist'), create);
router.put('/:id', auth, roleAuth('pharmacist'), update);
router.delete('/:id', auth, roleAuth('pharmacist'), deleteVendor);

module.exports = router;