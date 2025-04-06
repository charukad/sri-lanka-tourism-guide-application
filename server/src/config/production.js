// server/src/config/production.js
module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "30d",
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  weatherApiKey: process.env.WEATHER_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
};
