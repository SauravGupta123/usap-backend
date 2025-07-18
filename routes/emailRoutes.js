const express = require("express");
const router = express.Router();
const { sendOtp,forgotPassword } = require("../controllers/emailController");

router.post("/sendOtp", sendOtp);
router.post("/forgotPassword", forgotPassword);

module.exports = router;
