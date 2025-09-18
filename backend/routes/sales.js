const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  create,
  getAll,
  return: returnSale
} = require('../controllers/saleController');

router.post('/', auth, roleAuth('pharmacist'), create);
router.get('/', auth, roleAuth('pharmacist'), getAll);
router.post('/:id/return', auth, roleAuth('pharmacist'), returnSale);

module.exports = router;