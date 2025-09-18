const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const { getAll, markAsRead } = require('../controllers/notificationController');

router.get('/', auth, roleAuth('doctor'), getAll);
router.post('/:id/read', auth, roleAuth('doctor'), markAsRead);

module.exports = router;