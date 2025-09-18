// routes/emergency.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  alertDoctor,
  notifyFamily,
  shareLocation,
  triggerAmbulance
} = require('../controllers/emergencyController');

// GET /api/emergency/contacts — List all emergency contacts
router.get('/contacts', auth, roleAuth('patient'), getContacts);

// POST /api/emergency/contacts — Add new emergency contact
router.post('/contacts', auth, roleAuth('patient'), addContact);

// PUT /api/emergency/contacts/:id — Update emergency contact
router.put('/contacts/:id', auth, roleAuth('patient'), updateContact);

// DELETE /api/emergency/contacts/:id — Delete emergency contact
router.delete('/contacts/:id', auth, roleAuth('patient'), deleteContact);

// POST /api/emergency/alert-doctor — Alert assigned doctor
router.post('/alert-doctor', auth, roleAuth('patient'), alertDoctor);

// POST /api/emergency/notify-family — Notify all active family contacts
router.post('/notify-family', auth, roleAuth('patient'), notifyFamily);

// POST /api/emergency/share-location — Share current GPS location
router.post('/share-location', auth, roleAuth('patient'), shareLocation);

// POST /api/emergency/ambulance — Trigger ambulance dispatch
router.post('/ambulance', auth, roleAuth('patient'), triggerAmbulance);

module.exports = router;