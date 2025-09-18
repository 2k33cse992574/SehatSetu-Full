// utils/otpGenerator.js
const twilio = require('twilio');

// ✅ DEBUG: Validate credentials
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

if (!sid || !token || !fromNumber) {
  throw new Error('❌ Twilio credentials missing in .env file');
}

// Check for invisible characters / extra spaces
if (sid.trim() !== sid || token.trim() !== token || fromNumber.trim() !== fromNumber) {
  console.error('❌ TWILIO CREDENTIALS HAVE EXTRA SPACES!');
}

// Check length
if (sid.length !== 34) console.error(`❌ INVALID SID LENGTH: ${sid.length} (should be 34)`);
if (token.length !== 32) console.error(`❌ INVALID TOKEN LENGTH: ${token.length}`);
if (!fromNumber.startsWith('+')) console.error('❌ Twilio phone number must start with + and country code');

// ✅ Initialize Twilio client
const client = twilio(sid, token);

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio SMS
const sendOTP = async (phone, otp) => {
  try {
    // DEBUG log
    console.log('📱 Sending OTP to:', `+91${phone}`);
    console.log('🔢 OTP:', otp);

    const message = await client.messages.create({
      body: `Your SehatSetu Nabha OTP is ${otp}. Do not share it with anyone.`,
      from: fromNumber,
      to: `+91${phone}`,
    });

    console.log('✅ OTP sent via Twilio:', message.sid);
    return true;
  } catch (error) {
    console.error('❌ TWILIO ERROR OBJECT:', error);
    console.error('❌ TWILIO ERROR MESSAGE:', error.message);
    console.error('❌ TWILIO ERROR CODE:', error.code);
    console.error('❌ TWILIO MORE INFO:', error.moreInfo);

    throw new Error('Failed to send OTP. Please try again.');
  }
};

module.exports = { generateOTP, sendOTP };
