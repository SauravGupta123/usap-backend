const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const cookie = require('cookie');

const APP_SECRET = 'heyLarfItsME'; // Replace with your actual app secret key

const authenticateUser = async (req, res, next) => {
  try {
    // Extract the JWT token from the cookie
    const token = req.cookies.jwt;

    if (!token) {
      // No token found, user is not authenticated
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Verify the token
    const decodedToken = await jwt.verify(token, APP_SECRET);

    // Find the user in the database using the decoded token
    const user = await userModel.findById(decodedToken._id);

    if (!user) {
      // User not found, token is invalid
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Attach the user object to the request for further processing
    req.user = user;

    // Continue with the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

module.exports = authenticateUser;
