const axios = require('axios');

// POST /api/ai/insights — Send patient data → get risk score
exports.getInsights = async (req, res) => {
  const { patientId, symptoms, age, gender, chronicConditions } = req.body;

  // Verify doctor owns patient
  const appointment = await Appointment.findOne({
    patientId,
    doctorId: req.user.id
  });

  if (!appointment) {
    return res.status(403).json({ message: 'Not authorized to view this patient' });
  }

  try {
    const response = await axios.post(process.env.AI_SERVICE_URL + '/insights', {
      patientId,
      symptoms,
      age,
      gender,
      chronicConditions,
    }, {
      timeout: 10000,
      headers: { 'Authorization': `Bearer ${process.env.AI_SERVICE_TOKEN}` }
    });

    // Store result in medical record (optional)
    const record = new MedicalRecord({
      patientId,
      title: `AI Insight: ${response.data.condition}`,
      type: 'ai-insight',
      description: JSON.stringify(response.data),
      fileUrl: null,
      uploadedBy: 'system',
    });

    await record.save();

    res.json(response.data);
  } catch (error) {
    console.error('AI Service Error:', error.message);
    res.status(500).json({ message: 'AI service unavailable' });
  }
};

// POST /api/ai/symptom-checker — Symptom → possible conditions
exports.symptomChecker = async (req, res) => {
  const { symptoms, age, gender } = req.body;

  try {
    const response = await axios.post(process.env.AI_SERVICE_URL + '/symptom-checker', {
      symptoms,
      age,
      gender,
    }, {
      timeout: 10000,
      headers: { 'Authorization': `Bearer ${process.env.AI_SERVICE_TOKEN}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Symptom Checker Error:', error.message);
    res.status(500).json({ message: 'AI service unavailable' });
  }
};