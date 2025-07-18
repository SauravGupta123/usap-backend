const mongoose = require("mongoose");

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  membership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Membership",
    required: true,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Add more fields as needed for your transactions
});

// Create the Transaction model
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
