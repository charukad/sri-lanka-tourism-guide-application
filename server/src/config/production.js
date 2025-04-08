module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "30d",
  port: process.env.PORT || 5000,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  weatherApiKey: process.env.WEATHER_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  email: {
    sendgrid_api_key: process.env.SENDGRID_API_KEY,
    from_email: process.env.FROM_EMAIL || "info@srilankatourismguide.com",
  },
  sms: {
    twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
    twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
    twilio_phone_number: process.env.TWILIO_PHONE_NUMBER,
  },
  corsOrigins: process.env.CORS_ORIGINS || "*",
  nodeEnv: "production",
  logLevel: process.env.LOG_LEVEL || "error",
};
