const express = require("express");
const jwt = require("jsonwebtoken");
const upiModel = require("../models/upiModel");
const createPayment = (req, res) => {
  // Extract the user_id from the JWT token
  const token = req.headers.authorization; // Assuming the token is passed in the request headers
  const decoded = jwt.decode(token, { complete: true });
  const user_id = decoded.user_id;

  // Extract data from the request body
  const { user_email, app, amount, receiverName, transactionNote } = req.body;

  // Create a new UPIPayment instance
  const newPayment = new upiModel({
    user_id,
    user_email,
    app,
    amount,
    receiverName,
    transactionNote,
  });

  // Save the payment record to the database
  newPayment.save((err, payment) => {
    if (err) {
      return res.status(500).json({ error: "Error saving payment data" });
    }
    res.status(201).json(payment);
  });
};

module.exports = {
  createPayment,
};
