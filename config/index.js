const dotEnv = require("dotenv");
dotEnv.config();

module.exports = {
  PORT: process.env.PORT,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  MONGODB_URL: process.env.MONGODB_URI,
  JWT_KEY: process.env.JWT_KEY,
  BASE_URL: process.env.BASE_URL,
  RAZORPAY_SECRET: process.env.RAZORPAY_SECRET,
  RAZORPAY_KEY: process.env.RAZORPAY_KEY,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  FRONT_END_URL: process.env.FRONT_END_URL,
  REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  SALT_KEY: process.env.SALT_KEY,
  MERCHANT_ID: process.env.MERCHANT_ID,
};
