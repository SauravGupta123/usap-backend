require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { PORT } = require('./config');
const session = require("express-session");
const passport = require("passport");
const connectDb = require("./config/databaseConnection");
const userRouter = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoute = require("./routes/auth");
const cookieSession = require("cookie-session");
const passportSetup = require("./passport");
const enquiryRoutes = require("./routes/enquiryRoutes");
const emailNotification = require("./routes/emailRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const packageRoutes = require("./routes/packageRoutes");
const upiRoutes = require("./routes/upiRoutes");
const adminRoutes= require("./routes/adminRoutes");
const emailRoutes = require("./routes/emailRoutes");
const userAuth = require('./middleware/authMiddleware');
const path = require('path');

const app = express();
// const PORT = PORT || 3000;

// Middleware
// const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

// const corsOptions = {
//   origin: allowedOrigins,
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   credentials: true, // If you are using cookies or sessions
// };


const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // Alternative local development
  process.env.CLIENT_URL  // Production URL (set this in your .env)
];

// const corsOptions = {
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,  // Allow credentials
//   optionsSuccessStatus: 200
// };


const corsOptions = {
  origin: '*', // Allow all origins
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
};

app.use(cors(corsOptions));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("tiny"));

// Database connection
connectDb();

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to USAP!");
  res.status(200);
});
// app.use("/auth", authRoute); //google Auth
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/user", userRouter);
app.use("/admin",adminRoutes);
app.use('/email', emailRoutes);
app.use('/enquiry',enquiryRoutes);
app.use('/auth', authRoute);
app.use("/member", userAuth, membershipRoutes);
app.use("/packages", userAuth, packageRoutes);
app.use("/upi", userAuth, upiRoutes);
app.use("/api/payment", userAuth, paymentRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
