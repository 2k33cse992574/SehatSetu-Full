const Batch = require('../models/Batch');
const Alert = require('../models/Alert');

// Run daily via cron
exports.generateAlerts = async () => {
  const today = new Date();
  const expiringIn7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lowStockThreshold = 10; // units

  // Expiring soon
  const expiringBatches = await Batch.find({
    expiryDate: { $lte: expiringIn7Days },
    status: 'active'
  });

  for (let b of expiringBatches) {
    const alert = new Alert({
      recipientId: b.pharmacistId,
      type: 'expiry-alert',
      title: `Medicine expiring soon: ${b.medicineId.name}`,
      message: `${b.batchNumber} expires on ${b.expiryDate.toLocaleDateString()}. Qty: ${b.quantity}`,
      meta: { batchId: b._id, medicineId: b.medicineId }
    });
    await alert.save();
  }

  // Low stock
  const lowStockBatches = await Batch.find({
    quantity: { $lte: lowStockThreshold },
    status: 'active'
  });

  for (let b of lowStockBatches) {
    const alert = new Alert({
      recipientId: b.pharmacistId,
      type: 'low-stock',
      title: `Low stock: ${b.medicineId.name}`,
      message: `${b.batchNumber} has only ${b.quantity} units left.`,
      meta: { batchId: b._id, medicineId: b.medicineId }
    });
    await alert.save();
  }

  console.log(`✅ Generated ${expiringBatches.length} expiry alerts and ${lowStockBatches.length} low-stock alerts`);
};