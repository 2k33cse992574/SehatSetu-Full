// controllers/emergencyController.js

const EmergencyContact = require('../models/EmergencyContact');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { sendSMS } = require('../utils/alertManager');

// GET /api/emergency/contacts — Get all emergency contacts for logged-in patient
exports.getContacts = async (req, res) => {
  const contacts = await EmergencyContact.find({ patientId: req.user.id })
    .sort({ name: 1 });

  res.json(contacts);
};

// POST /api/emergency/contacts — Add new emergency contact
exports.addContact = async (req, res) => {
  const { name, phone, relationship } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required' });
  }

  const contact = new EmergencyContact({
    patientId: req.user.id,
    name,
    phone,
    relationship,
    isActive: true
  });

  await contact.save();
  res.status(201).json(contact);
};

// PUT /api/emergency/contacts/:id — Update emergency contact
exports.updateContact = async (req, res) => {
  const { id } = req.params;
  const { name, phone, relationship, isActive } = req.body;

  const contact = await EmergencyContact.findOneAndUpdate(
    { _id: id, patientId: req.user.id },
    { name, phone, relationship, isActive },
    { new: true, runValidators: true }
  );

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found or unauthorized' });
  }

  res.json(contact);
};

// DELETE /api/emergency/contacts/:id — Delete emergency contact
exports.deleteContact = async (req, res) => {
  const { id } = req.params;

  const contact = await EmergencyContact.findOneAndDelete({
    _id: id,
    patientId: req.user.id
  });

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found or unauthorized' });
  }

  res.json({ message: 'Contact deleted' });
};

// POST /api/emergency/alert-doctor — Send alert to assigned doctor
exports.alertDoctor = async (req, res) => {
  const { doctorId, message } = req.body;

  if (!doctorId) {
    return res.status(400).json({ message: 'Doctor ID is required' });
  }

  // Fetch doctor's user record to get phone
  const doctor = await User.findById(doctorId).select('phone');
  if (!doctor || !doctor.phone) {
    return res.status(404).json({ message: 'Doctor not found or no phone registered' });
  }

  // Create alert log
  const alert = new Alert({
    patientId: req.user.id,
    type: 'emergency',
    title: 'SOS Alert: Medical Emergency',
    message: message || 'Patient triggered emergency alert',
    triggeredAt: new Date(),
    meta: { doctorId }
  });

  await alert.save();

  // Send SMS to doctor
  await sendSMS(doctor.phone, `🚨 EMERGENCY ALERT from ${req.user.name}: ${message || 'Urgent medical help needed!'}`);

  res.json({ message: 'Emergency alert sent to doctor', alertId: alert._id });
};

// POST /api/emergency/notify-family — Notify all active emergency contacts
exports.notifyFamily = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  const contacts = await EmergencyContact.find({
    patientId: req.user.id,
    isActive: true
  });

  if (contacts.length === 0) {
    return res.status(404).json({ message: 'No active emergency contacts found' });
  }

  // Send SMS to each contact
  const failed = [];
  for (let contact of contacts) {
    try {
      await sendSMS(contact.phone, `🚨 URGENT: ${req.user.name} needs help. Message: ${message}`);
    } catch (err) {
      failed.push({ phone: contact.phone, error: err.message });
    }
  }

  // Log alert
  const alert = new Alert({
    patientId: req.user.id,
    type: 'emergency',
    title: 'Family Notified',
    message: `Notified ${contacts.length} family members`,
    triggeredAt: new Date(),
    meta: { notifiedContacts: contacts.map(c => c._id) }
  });

  await alert.save();

  res.json({
    message: `Notified ${contacts.length} contacts.`,
    failed,
    alertId: alert._id
  });
};

// POST /api/emergency/share-location — Share live location (store in DB or push to Firebase)
exports.shareLocation = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required' });
  }

  // Store in user profile for later retrieval (optional)
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { lastKnownLocation: { type: 'Point', coordinates: [lng, lat] } },
    { new: true }
  ).select('lastKnownLocation');

  // In production: Push to Firebase Realtime DB or MQTT for live tracking
  // For MVP: Just store in DB

  res.json({
    message: 'Location shared successfully',
    location: { lat, lng },
    userId: req.user.id
  });
};

// POST /api/emergency/ambulance — Trigger ambulance dispatch (mock integration)
exports.triggerAmbulance = async (req, res) => {
  const { message } = req.body;

  // In real app: Integrate with local ambulance services via API
  // For MVP: Log and notify admin

  const alert = new Alert({
    patientId: req.user.id,
    type: 'emergency',
    title: 'Ambulance Requested',
    message: message || 'Ambulance requested by patient',
    triggeredAt: new Date(),
    meta: { category: 'ambulance' }
  });

  await alert.save();

  // Optional: Notify admin (you can add this later)
  console.log(`🚨 AMBULANCE REQUESTED: Patient ${req.user.name} (${req.user.phone}) - ${message || 'No message'}`);

  res.json({
    message: 'Ambulance dispatched (simulated). Please wait for response.',
    alertId: alert._id
  });
};