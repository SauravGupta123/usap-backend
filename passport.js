const GoogleStrategy = require("passport-google-oauth2").Strategy;
const cookie = require("cookie");
const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // Import jwt library
const userModel = require("./models/userModel");
const {JWT_KEY, CLIENT_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET} = require('./config');
const passport = require("passport");

// const APP_SECRET = "heyLarfItsME"; // Replace with your actual app secret key

const GenerateSignature = async (payload) => {
  return await jwt.sign(payload, JWT_KEY, { expiresIn: "7d" });
};

const generatePassword = () => {
  const keyBytes = crypto.randomBytes(4); // 4 bytes = 32 bits
  return keyBytes.toString("hex");
};

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL:
       
        `${process.env.BASE_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const verifyGoogle = async (req, res) => {
  try {
    const { sub, given_name, family_name, email, picture,membershipType,countryResiding } = req.user;

    let user = await userModel.findOne({ email: email });

    if (!user) {
      user = new userModel({
        firstName: given_name,
        lastName: family_name,
        password: generatePassword(),
        email: email,
        googleId: sub,
        membershipType: membershipType,
        countryResiding: countryResiding,
      });

      // await user.save();
    }

    const token = await GenerateSignature({
      email: user.email,
      _id: user._id,
    });

    // Send user data and token to the frontend
    res.status(200).json({
      success: true,
      message: {
        name: user.firstName,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).redirect(`${CLIENT_URL}/login`);
  }
};


module.exports = verifyGoogle;
