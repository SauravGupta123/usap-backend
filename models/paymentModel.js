const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
  },

  receipt: {
    type: String,
  },
  currency: {
    type: String,
  },
  receipt: {
    type: String,
  },
  user: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
  email: {
    type: String,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["COD", "stripe", "razorpay", "upi", "phonepe"],
  },
  paymentStatus: {
    type: String,
    default: "Pending",
  },
  phoneNumber: {
    type: Number,
  },
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
