const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const { getInsights, symptomChecker } = require('../controllers/aiController');

router.post('/insights', auth, roleAuth('doctor'), getInsights);
router.post('/symptom-checker', auth, roleAuth('doctor'), symptomChecker);

module.exports = router;