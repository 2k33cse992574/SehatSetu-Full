const axios = require('axios');

const sendSMS = async (phone, message) => {
  const url = 'https://api.msg91.com/api/v5/flow/';
  const data = {
    flow_id: 'your_alert_flow_id_here', // Create in MSG91 dashboard
    mobiles: phone,
    values: { message }
  };

  const headers = { 'authkey': process.env.MSG91_API_KEY };

  try {
    await axios.post(url, data, { headers });
  } catch (err) {
    console.error('Alert SMS failed:', err.message);
  }
};

module.exports = { sendSMS };