const mongoose = require("mongoose");

// Define the package schema
const packageSchema = new mongoose.Schema({
  package_name: {
    type: String,
    enum: ["student", "professional", "longterm", "faculty"],
    required: true,
  },
  package_type: {
    type: String,
    enum: ["college", "school"],
    required: true,
  },
  package_id: {
    type: String,
    required: true,
    unique: true, // Ensure that each package has a unique package_id
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  durationMonths: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now, // Sets the default value to the current date and time
  },
  // You can add more fields as needed
});

// Create the package model
const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
