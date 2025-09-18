const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateTwilioToken = async (consultationId, role) => {
  const identity = `${role}-${consultationId}`;
  const token = new twilio.jwt.AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );

  const voiceGrant = new twilio.jwt.AccessToken.VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
  });

  token.addGrant(voiceGrant);

  return token.toJwt();
};

module.exports = { generateTwilioToken };