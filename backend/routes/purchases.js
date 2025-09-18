const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  getAll,
  create,
  update,
  delete: deletePurchase
} = require('../controllers/purchaseController');

router.get('/', auth, roleAuth('pharmacist'), getAll);
router.post('/', auth, roleAuth('pharmacist'), create);
router.put('/:id', auth, roleAuth('pharmacist'), update);
router.delete('/:id', auth, roleAuth('pharmacist'), deletePurchase);

module.exports = router;