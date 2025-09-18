const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

const { get, update } = require('../controllers/adminSettingController');

router.get('/', adminAuth, get);
router.patch('/', adminAuth, update);

module.exports = router;