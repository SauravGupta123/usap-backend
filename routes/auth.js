const jwt = require("jsonwebtoken");
const router = require("express").Router();
const passport = require("passport");
const verifyGoogle = require("../passport");
const crypto = require("crypto");
const { CLIENT_URL, JWT_SECRET } = require('../config'); // Ensure you have a JWT_SECRET in your config
const session = require("express-session");
const User = require('../models/userModel.js');

const authenticateUser = require("../middleware/googleAuth");

const generate32BitKey = () => {
  const keyBytes = crypto.randomBytes(4); // 4 bytes = 32 bits
  return keyBytes.toString("hex");
};

const secretKey32Bit = generate32BitKey();

router.use(
  session({
    secret: secretKey32Bit,
    resave: false,
    saveUninitialized: false,
  })
);

router.use(passport.initialize());
router.use(
  passport.session({
    secret: secretKey32Bit,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

router.get(
  "/verifyGoogle/",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/verifyGoogle/failure",
  }),
  async (req, res) => {
    const user = req.user;

    // Check if the user already exists in the database
    let existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      // Create a JWT token for the existing user
      const token = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.displayName,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      const userData = {
        name: existingUser.firstName+" "+existingUser.lastName,
        email: user.email,
        token,
        picture: existingUser.picture,
        phone: existingUser.phoneNo,
      };

      // Redirect to home page with token
      return res.redirect(`${CLIENT_URL}/login?user=${encodeURIComponent(JSON.stringify(userData))}`);
    } else {
      // Create the JWT token for the new user
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.displayName,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );

      const userData = {
        name: user.displayName,
        email: user.email,
        token,
        picture: user.picture,
        phone: null,
      };

      // Redirect to additional info page
      return res.redirect(
        `${CLIENT_URL}/additionalInfo?user=${encodeURIComponent(JSON.stringify(userData))}`
      );
    }
  }
);

router.use("/verifyGoogle/protected", isLoggedIn, verifyGoogle);

router.use("/verifyGoogle/failure", (req, res) => {
  return res.redirect(`${CLIENT_URL}/login`);
});

router.get("/profile", authenticateUser, (req, res) => {
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      picture: req.user.picture,
    },
  });
});

router.use("/verifyGoogle/logout", (req, res) => {
  req.session.destroy();
  return res.redirect(CLIENT_URL);
});

module.exports = router;
