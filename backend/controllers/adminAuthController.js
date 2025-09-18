const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');

// POST /api/auth/login — Admin login
exports.login = async (req, res) => {
  const { email, phone, password } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ message: 'Email or phone required' });
  }

  let admin = await Admin.findOne(
    email ? { email } : { phone }
  );

  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  admin.lastLogin = new Date();
  await admin.save();

  const token = generateToken(admin);

  res.json({
    message: 'Login successful',
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
    },
  });
};

// POST /api/auth/logout — Clear session (client-side delete token)
exports.logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

// GET /api/auth/session — Check active session
exports.session = (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    isAuthenticated: true,
    admin: {
      id: req.admin.id,
      name: req.admin.name,
      email: req.admin.email,
      phone: req.admin.phone,
      role: req.admin.role,
    },
  });
};