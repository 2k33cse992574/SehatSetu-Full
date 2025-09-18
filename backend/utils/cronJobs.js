const cron = require('node-cron');
const { generateAlerts } = require('../services/inventoryService');

// Run every day at 2 AM
cron.schedule('0 2 * * *', () => {
  console.log('⏰ Running daily inventory alert job...');
  generateAlerts().catch(console.error);
});

module.exports = cron;