const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  create, getAll, download, share, getTypes
} = require('../controllers/medicalRecordController');

router.post('/', auth, roleAuth('patient'), create);
router.get('/', auth, roleAuth('patient'), getAll);
router.get('/:id/download', auth, roleAuth('patient'), download);
router.post('/share', auth, roleAuth('patient'), share);
router.get('/types', auth, roleAuth('patient'), getTypes);

module.exports = router;