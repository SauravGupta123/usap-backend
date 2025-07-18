require("dotenv").config();
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const otpStorage = new Map();


const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Set to true if your server requires a secure connection (e.g., TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
function generateOTP(length = 6) {
  const digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}



const sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  console.log("sending otp to email", email);

  const otp = generateOTP(); // Generate a 6-digit OTP
  console.log("generated otp",otp);
  // Store OTP (use a database in production)
  otpStorage.set(email, otp);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification for Indian Students Asssistance Portal (ISAP)',
    text: `Your OTP for email verification is: ${otp}.please do not share this OTP with anyone.`
  };

  try {
    console.log("attempting to send otp in mail: ",email," otp: ",otp); 
    await transporter.sendMail(mailOptions);
    console.log("otp sent successfully");
    res.status(200).json({ success: true, message: 'OTP sent successfully', otp: otp });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const otp = generateOTP(); // Generate a 6-digit OTP
  console.log(otp);
  // Store OTP (use a database in production)
  otpStorage.set(email, otp);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Password for ISAP Account',
    text: `Your OTP is: ${otp}. please do not share this OTP with anyone.`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'OTP sent successfully', otp: otp });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};






module.exports = { sendOtp, forgotPassword };
