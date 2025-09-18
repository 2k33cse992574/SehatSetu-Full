const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  create,
  update,
  delete: deleteBatch
} = require('../controllers/batchController');

router.post('/medicines/:id/batches', auth, roleAuth('pharmacist'), create);
router.put('/medicines/:id/batches/:bid', auth, roleAuth('pharmacist'), update);
router.delete('/medicines/:id/batches/:bid', auth, roleAuth('pharmacist'), deleteBatch);

module.exports = router;