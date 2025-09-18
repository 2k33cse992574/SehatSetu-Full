const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');

// GET /api/users/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-otp -otpExpires -password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

// PUT /api/users/me
exports.updateMe = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'gender', 'age'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
  res.json(user);
};

// POST /api/users/me/avatar
exports.uploadAvatar = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const url = await uploadToCloudinary(req.file.buffer, 'avatars');
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: url }, { new: true });
    res.json({ avatar: url });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
};

// GET /api/users/family-members
exports.getFamilyMembers = async (req, res) => {
  const user = await User.findById(req.user.id).select('familyMembers');
  res.json(user?.familyMembers || []);
};

// POST /api/users/family-members
exports.addFamilyMember = async (req, res) => {
  const { name, relationship, age, gender, phone, medicalConditions } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $push: { familyMembers: { name, relationship, age, gender, phone, medicalConditions } } },
    { new: true, select: 'familyMembers' }
  );

  res.status(201).json(user.familyMembers.slice(-1)[0]);
};

// PUT /api/users/family-members/:id
exports.updateFamilyMember = async (req, res) => {
  const { id } = req.params;
  const update = req.body;

  const user = await User.findOneAndUpdate(
    { _id: req.user.id, 'familyMembers._id': id },
    { $set: { 'familyMembers.$': update } },
    { new: true }
  );

  if (!user) return res.status(404).json({ message: 'Family member not found' });
  res.json(user.familyMembers.find(m => m._id.toString() === id));
};

// DELETE /api/users/family-members/:id
exports.deleteFamilyMember = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { familyMembers: { _id: id } } },
    { new: true }
  );

  if (!user) return res.status(404).json({ message: 'Family member not found' });
  res.json({ message: 'Deleted' });
};