// Import the Mongoose library for MongoDB interactions
const mongoose = require("mongoose");
require("dotenv").config();

// Import the "colors" package to add color to console logs
require("colors");

// Define an asynchronous function to connect to the MongoDB database
const connectDb = async () => {
  try {
    // Attempt to establish a database connection using the provided URI
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    // If connection is successful, log the host of the connected database in yellow color
    console.log(`Mongodb Connected ${conn.connection.host}`.yellow);
  } catch (error) {
    // If an error occurs during the connection attempt:
    // Log the error message in red color
    console.error(`Error : ${error.message}`.green);
    // Terminate the Node.js process with an exit code of 1 (indicating an error)
    process.exit(1);
  }
};

// Export the connectDb function to be used in other parts of the application
module.exports = connectDb;
