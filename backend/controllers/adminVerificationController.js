const VerificationRequest = require('../models/VerificationRequest');
const User = require('../models/User');

// GET /api/admin/verifications — List with filters
exports.getAll = async (req, res) => {
  const { status, type } = req.query;

  let query = {};
  if (status && status !== 'All') query.status = status.toLowerCase(); // ← normalize
  if (type && type !== 'All') query.type = type.toLowerCase();        // ← normalize

  const requests = await VerificationRequest.find(query)
    .populate('userId', 'phone role verificationStatus')
    .sort({ submittedAt: -1 });

  res.json(requests);
};

// GET /api/admin/verifications/:id — Get single request
exports.getById = async (req, res) => {
  const request = await VerificationRequest.findById(req.params.id)
    .populate('userId', 'phone role verificationStatus');

  if (!request) return res.status(404).json({ message: 'Request not found' });

  res.json(request);
};

// POST /api/admin/verifications/:id/verify
exports.verify = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const request = await VerificationRequest.findById(id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  if (request.status !== 'pending') { // ← FIXED: lowercase
    return res.status(400).json({ message: 'Already processed' });
  }

  // Update request
  request.status = 'verified'; // ← FIXED: lowercase
  request.verifiedAt = new Date();
  request.verifiedBy = req.admin._id;
  if (notes) request.notes.push(notes);
  await request.save();

  // ✅ Update associated User using userId
  const user = await User.findById(request.userId);
  if (user) {
    user.verificationStatus = 'approved'; // ← matches User schema
    user.isVerified = true;
    await user.save();

    // Notify user
    sendVerificationEmail(user, 'verified', request.type); // ← type is still lowercase
  }

  res.json({ message: 'Verified successfully', request });
};

// POST /api/admin/verifications/:id/reject
exports.reject = async (req, res) => {
  const { id } = req.params;
  const { reason, notes } = req.body;

  const request = await VerificationRequest.findById(id);
  if (!request) return res.status(404).json({ message: 'Request not found' });

  if (request.status !== 'pending') { // ← FIXED: lowercase
    return res.status(400).json({ message: 'Already processed' });
  }

  request.status = 'rejected'; // ← FIXED: lowercase
  request.verifiedAt = new Date();
  request.verifiedBy = req.admin._id;
  if (reason) request.notes.push(`Reason: ${reason}`);
  if (notes) request.notes.push(notes);
  await request.save();

  // ✅ Update associated User using userId
  const user = await User.findById(request.userId);
  if (user) {
    user.verificationStatus = 'rejected'; // ← matches User schema
    await user.save();

    // Notify user
    sendVerificationEmail(user, 'rejected', request.type);
  }

  res.json({ message: 'Rejected successfully', request });
};

// Helper: Send email/SMS to applicant
function sendVerificationEmail(user, status, type) {
  if (!user || !user.phone) return;

  const message =
    status === 'verified'
      ? `🎉 Congratulations! Your ${type} verification is approved. You can now practice on SehatSetu Nabha.`
      : `❌ Your ${type} verification was rejected. Reason: Please contact support.`;

  const { sendSMS } = require('../utils/alertManager');
  sendSMS(user.phone, message);
}

// GET /api/admin/stats
exports.stats = async (req, res) => {
  const pendingCount = await VerificationRequest.countDocuments({ status: 'pending' }); // ← FIXED
  const doctorPending = await VerificationRequest.countDocuments({ 
    type: 'doctor', // ← FIXED: lowercase
    status: 'pending' 
  });
  const pharmacistPending = await VerificationRequest.countDocuments({ 
    type: 'pharmacist', // ← FIXED: lowercase
    status: 'pending' 
  });

  const verifiedThisMonth = await VerificationRequest.countDocuments({
    status: 'verified', // ← FIXED: lowercase
    verifiedAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) },
  });

  res.json({
    pending_verifications: pendingCount,
    doctor_verifications: doctorPending,
    pharmacist_verifications: pharmacistPending,
    verified_this_month: verifiedThisMonth,
  });
};