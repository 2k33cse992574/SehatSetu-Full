const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
const mongoose = require('mongoose');
require('dotenv').config();

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Admin.findOne({ email: 'admin@sehatsetu.in' });
  if (existing) {
    console.log('✅ Admin already exists');
    return;
  }

  const hashed = await bcrypt.hash('AdminPass123!', 10); // Change this!

  const admin = new Admin({
    name: 'Super Admin',
    email: 'admin@sehatsetu.in',
    phone: '8299257424',
    passwordHash: hashed,
  });

  await admin.save();
  console.log('✅ Admin seeded!');
  mongoose.disconnect();
}

seedAdmin().catch(console.error);