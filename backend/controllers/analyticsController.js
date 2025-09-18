const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');
const User = require('../models/User');

// GET /api/analytics/dashboard — All stats
exports.dashboard = async (req, res) => {
  const doctorId = req.user.id;

  const totalPatients = await Appointment.distinct('patientId', { doctorId });
  const totalAppointments = await Appointment.countDocuments({ doctorId });
  const upcomingAppointments = await Appointment.countDocuments({
    doctorId,
    status: 'scheduled',
    date: { $gte: new Date() }
  });
  const completedConsultations = await Consultation.countDocuments({
    doctorId,
    status: 'ended'
  });
  const prescriptionsIssued = await Prescription.countDocuments({
    doctorId,
    status: 'active'
  });

  res.json({
    totalPatients: totalPatients.length,
    totalAppointments,
    upcomingAppointments,
    completedConsultations,
    prescriptionsIssued,
  });
};

// GET /api/analytics/patients — Trends (new vs returning)
exports.patients = async (req, res) => {
  const doctorId = req.user.id;

  const appointments = await Appointment.find({ doctorId })
    .populate('patientId', 'name')
    .sort({ date: 1 });

  const patientIds = appointments.map(a => a.patientId._id);
  const uniquePatients = [...new Set(patientIds)];

  const firstVisit = appointments.filter(a => patientIds.indexOf(a.patientId._id) === patientIds.findIndex(id => id === a.patientId._id));
  const returningPatients = uniquePatients.length - firstVisit.length;

  res.json({
    newPatients: firstVisit.length,
    returningPatients,
    totalUniquePatients: uniquePatients.length,
  });
};

// GET /api/analytics/consultations — Weekly trend
exports.consultations = async (req, res) => {
  const doctorId = req.user.id;
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const data = await Consultation.aggregate([
    {
      $match: {
        doctorId: mongoose.Types.ObjectId(doctorId),
        startedAt: { $gte: lastWeek }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
};

// GET /api/analytics/prescriptions — Monthly trend
exports.prescriptions = async (req, res) => {
  const doctorId = req.user.id;
  const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const data = await Prescription.aggregate([
    {
      $match: {
        doctorId: mongoose.Types.ObjectId(doctorId),
        issuedAt: { $gte: lastMonth }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$issuedAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
};