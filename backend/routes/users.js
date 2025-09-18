const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  getMe, updateMe, uploadAvatar,
  getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember
} = require('../controllers/userController');

router.get('/me', auth, roleAuth('patient'), getMe);
router.put('/me', auth, roleAuth('patient'), updateMe);
router.post('/me/avatar', auth, roleAuth('patient'), uploadAvatar);

router.get('/family-members', auth, roleAuth('patient'), getFamilyMembers);
router.post('/family-members', auth, roleAuth('patient'), addFamilyMember);
router.put('/family-members/:id', auth, roleAuth('patient'), updateFamilyMember);
router.delete('/family-members/:id', auth, roleAuth('patient'), deleteFamilyMember);

module.exports = router;