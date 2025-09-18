const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const PurchaseRequest = require('../models/PurchaseRequest');

// GET /api/reports/sales — Daily/weekly/monthly
exports.sales = async (req, res) => {
  const { period } = req.query; // daily, weekly, monthly
  let filter = {};

  const now = new Date();
  if (period === 'daily') filter.createdAt = { $gte: new Date(now.setHours(0,0,0,0)) };
  else if (period === 'weekly') filter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
  else if (period === 'monthly') filter.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };

  const sales = await Sale.find({ pharmacistId: req.user.id, ...filter })
    .populate('batchId', 'medicineId sellingPrice')
    .sort({ createdAt: -1 });

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalSales = sales.length;

  res.json({ totalRevenue, totalSales, sales });
};

// GET /api/reports/stock
exports.stock = async (req, res) => {
  const batches = await Batch.find({ pharmacistId: req.user.id, status: 'active' })
    .populate('medicineId', 'name');

  const lowStock = batches.filter(b => b.quantity <= 10);
  const totalValue = batches.reduce((sum, b) => sum + (b.quantity * b.sellingPrice), 0);

  res.json({
    totalItems: batches.length,
    lowStockCount: lowStock.length,
    totalValue,
    batches,
    lowStock
  });
};

// GET /api/reports/expiry
exports.expiry = async (req, res) => {
  const today = new Date();
  const expiringIn7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const batches = await Batch.find({
    pharmacistId: req.user.id,
    expiryDate: { $lte: expiringIn7Days },
    status: 'active'
  }).populate('medicineId', 'name');

  res.json(batches);
};

// GET /api/reports/purchases
exports.purchases = async (req, res) => {
  const { status } = req.query;
  let filter = { pharmacistId: req.user.id };
  if (status) filter.status = status;

  const purchases = await PurchaseRequest.find(filter)
    .populate('vendorId', 'name')
    .populate('medicineId', 'name')
    .sort({ requestedAt: -1 });

  res.json(purchases);
};