// Import the jsonwebtoken library for generating JWT tokens
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Function to generate a JWT token with the provided user ID
const generateToken = (id) => {
  // Generate a JWT token containing the provided user ID
  // The token is signed using the JWT_KEY from the environment variables
  // The token expires after 30 days
  return jwt.sign({ id }, process.env.JWT_KEY, {
    expiresIn: "30d",
  });
};

// Export the generateToken function for use in other parts of the application
module.exports = generateToken;
