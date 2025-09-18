const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Allow frontend access
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// ---------------- ROUTES ---------------- //

// Phase 1: Auth
app.use('/api/auth', require('./routes/auth'));

// Phase 2: User & Patient Features
app.use('/api/users', require('./routes/users'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/medical-records', require('./routes/medical-records'));
app.use('/api/pharmacies', require('./routes/pharmacies'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/payments', require('./routes/payments'));

// Phase 3: Doctor Dashboard
app.use('/api/patients', require('./routes/patient'));
app.use('/api/prescriptions', require('./routes/prescription'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));

app.use('/api/staff', require('./routes/staff'));
app.use('/api', require('./routes/batches'));
app.use('/api/auth', require('./routes/adminAuth')); // 👈 Overlaps with user auth — but fine!
app.use('/api/admin/verifications', require('./routes/adminVerifications'));
app.use('/api/admin/settings', require('./routes/adminSettings'));
app.use('/api/pharmacist', require('./routes/pharmacistOnboardingRoutes'));
// Root
app.get('/', (req, res) => {
  res.send('SehatSetu Nabha Backend v3.0 — Live & Running 🚀\nHealthcare for Every Village');
});

// 404 Handler — ✅ Express v5 Safe
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    requestedPath: req.originalUrl,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
require('./utils/cronJobs'); // 👈 Add this line AFTER app.listen()
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API Docs: http://localhost:${PORT}`);
});
