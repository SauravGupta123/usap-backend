const mongoose = require("mongoose");

// Define the schema for the membership data
const membershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  studentType: {
    type: String,
    enum: ["school", "college"],
    required: true,
  },
  membershipType: {
    type: String,
    enum: ["student", "professional", "lifetime"],
    required: true,
  },
  dateOfBirth: {
    type: Date,
  },
  phoneNumber: {
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  address: [
    {
      type: {
        type: String,
        enum: ["home", "work", "university/college", "other"],
      },
      addressLine1: {
        type: String,
      },
      city: {
        type: String,
      },
      pincode: {
        type: String,
      },
      password: {
        type: String,
      },
      // You can add more address-related fields here if needed
    },
  ],
  paid: {
    type: Boolean,
    default: false, // You can set a default value if needed
  },
  paidAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    required: true,
    default: 'Pending'
  },
});

// Create the Membership model
const Membership = mongoose.model("Membership", membershipSchema);

module.exports = Membership;
