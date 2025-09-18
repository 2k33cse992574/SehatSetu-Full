const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const { generateTwilioToken } = require('../utils/twilio');

// POST /api/consultations
exports.create = async (req, res) => {
  try {
    const { appointmentId, type } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: 'Can only start consultation for scheduled appointments' });
    }

    const consultation = new Consultation({
      appointmentId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      type,
      status: 'pending',
    });

    const saved = await consultation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/consultations/:id/join
exports.join = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) return res.status(404).json({ message: 'Not found' });
    if (consultation.status !== 'pending') return res.status(400).json({ message: 'Already active or ended' });

    // Generate Twilio/WebRTC token
    const token = await generateTwilioToken(consultation._id.toString(), req.user.role);

    consultation.callToken = token;
    consultation.status = 'active';
    consultation.startedAt = new Date();
    await consultation.save();

    res.json({ token, consultationId: consultation._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/consultations/:id/end
exports.end = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) return res.status(404).json({ message: 'Not found' });
    if (consultation.status !== 'active') return res.status(400).json({ message: 'Not active' });

    consultation.status = 'ended';
    consultation.endedAt = new Date();
    await consultation.save();

    // Mark appointment as completed
    await Appointment.findByIdAndUpdate(consultation.appointmentId, { status: 'completed' });

    res.json({ message: 'Consultation ended' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/consultations/:id/chat
exports.getChat = async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id).select('chatHistory');
    if (!consultation) return res.status(404).json({ message: 'Not found' });

    res.json(consultation.chatHistory);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/consultations/:id/chat
exports.sendChat = async (req, res) => {
  try {
    const { message } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) return res.status(404).json({ message: 'Not found' });

    consultation.chatHistory.push({
      sender: req.user.role,
      message,
      timestamp: new Date(),
    });

    await consultation.save();
    res.status(201).json(consultation.chatHistory.slice(-1)[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/consultations/:id — Save consultation summary
exports.updateSummary = async (req, res) => {
  try {
    const { summary } = req.body;
    if (!summary) {
      return res.status(400).json({ message: 'Summary is required' });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });

    if (consultation.doctorId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    consultation.summary = summary;
    await consultation.save();

    res.json({ summary: consultation.summary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
