// const express = require("express");
// const jwt = require("jsonwebtoken");
// const Razorpay = require("razorpay");
// const shortid = require("shortid");

// const crypto = require("crypto");

const paymentModel = require("../models/paymentModel");
const userModel = require("../models/userModel");
const membershipModel = require("../models/membershipModel");

require("dotenv").config();

// app.post("/verification", (req, res) => {

const verification = async (req, res) => {
  const secret = "jugalWebHook";
  const sha256 = crypto.createHmac("sha256", secret);
  sha256.update(JSON.stringify(req.body));
  const calculatedSignature = sha256.digest("hex");

  console.log(calculatedSignature);

  const razorpaySignature = req.headers["x-razorpay-signature"];

  console.log(razorpaySignature);

  if (calculatedSignature === razorpaySignature) {
    console.log("Request is legit");

    // Extract the event from the Razorpay webhook payload
    const event = req.body;
    console.log(event);
    const event = req.body;
    console.log(event);

    if (event.event === "order.paid") {
      const paymentId = event.payload.payment.entity.id; // Extract payment ID
      const order_id = event.payload.payment.entity.order_id; // Extract order ID

      // You may also retrieve user details from the order, depending on how you structured your order data.
      const user = event.payload.payment.entity.notes.user; // Assuming you stored user details in the notes field

      res.json({ paymentId, order_id, user });
      console.log("Payment is captured; updating the database");

      // Create a new payment record and save it to the database
      const newPayment = new paymentModel({
        razorpay_order_id: order_id,
        razorpay_payment_id: paymentId,
        user: user,
        // Add other relevant fields as needed
      });

      try {
        const savedPayment = await newPayment.save();
        console.log("Payment record saved:", savedPayment);

        // Decode the JWT token and retrieve the user's ID
        const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId; // Retrieve the user's ID from the token

        // Store the user's ID in the payment record
        savedPayment.user = userId; // Set the user reference

        // Save the updated payment record
        await savedPayment.save();

        console.log("User ID associated with the payment:", userId);
      } catch (error) {
        console.error("Error saving payment record:", error);
      }
    }

    // Respond to the webhook request (e.g., return a 200 OK response)
    return res.status(200).json({
      message: "OK",
    });
  } else {
    return res.status(403).json({ message: "Invalid" });
  }
};

// const verification = async (req, res) => {
//   const secret = "jugalWebHook";
//   const sha256 = crypto.createHmac("sha256", secret);
//   sha256.update(JSON.stringify(req.body));
//   const calculatedSignature = sha256.digest("hex");

//   console.log(calculatedSignature);

//   const razorpaySignature = req.headers["x-razorpay-signature"];

//   console.log(razorpaySignature);

//   if (calculatedSignature === razorpaySignature) {
//     console.log("Request is legit");

//     // Extract the event from the Razorpay webhook payload
//     const event = req.body;
//     console.log(event);

//     if (event.event === "order.paid") {
//       const paymentId = event.payload.payment.entity.id; // Extract payment ID
//       const order_id = event.payload.payment.entity.order_id; // Extract order ID

//       // You may also retrieve user details from the order, depending on how you structured your order data.
//       const user = event.payload.payment.entity.notes.user; // Assuming you stored user details in the notes field

//       res.json({ paymentId, order_id, user });
//       console.log("Payment is captured; updating the database");

//       // Create a new payment record and save it to the database
//       const newPayment = new paymentModel({
//         razorpay_order_id: order_id,
//         razorpay_payment_id: paymentId,
//         user: user,
//         // Add other relevant fields as needed
//       });

//       try {
//         const savedPayment = await newPayment.save();
//         console.log("Payment record saved:", savedPayment);

//         // Decode the JWT token and retrieve the user's ID
//         const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//         const userId = decodedToken.userId; // Retrieve the user's ID from the token

//         // Store the user's ID in the payment record
//         savedPayment.user = userId; // Set the user reference

//         // Save the updated payment record
//         await savedPayment.save();

//         console.log("User ID associated with the payment:", userId);
//       } catch (error) {
//         console.error("Error saving payment record:", error);
//       }
//     }

//     // Respond to the webhook request (e.g., return a 200 OK response)
//     return res.status(200).json({
//       message: "OK",
//     });
//   } else {
//     return res.status(403).json({ message: "Invalid" });
//   }
//   // const secret = "jugalWebHook";
//   // const sha256 = crypto.createHmac("sha256", secret);
//   // sha256.update(JSON.stringify(req.body));
//   // const calculatedSignature = sha256.digest("hex");

//   // const razorpaySignature = req.headers["x-razorpay-signature"];

//   // if (calculatedSignature === razorpaySignature) {
//   //   console.log("Request is legit");

//   //   // Assuming your webhook payload contains the event and order.paid status
//   //   const { event, order } = req.body;

//   //   if (event === "order.paid") {
//   //     console.log("Order is paid; updating the database");
//   //     const paymentId = event.payload.payment.entity.id;
//   //     const order_id = event.payload.payment.entity.order_id;

//   //     const user = event.payload.payment.entity.notes.user;

//   //     // You can now update the database as needed
//   //     // Example: Update a membership record in the database
//   //     try {

//   //       console.log("Database updated");
//   //     } catch (error) {
//   //       console.error("Error updating the database:", error);
//   //     }
//   //   }

//   //   // Respond to the webhook request (e.g., return a 200 OK response)
//   //   return res.status(200).json({
//   //     message: "OK",
//   //   });
//   // } else {
//   //   res.status(403).json({ message: "Invalid" });
//   // }
// };

// // const Membership = require("../models/membershipModel");

// // // Webhook handler
// // const verification = async (req, res) => {
// //   const secret = "jugalWebHook";
// //   const sha256 = crypto.createHmac("sha256", secret);
// //   sha256.update(JSON.stringify(req.body));
// //   const calculatedSignature = sha256.digest("hex");

// //   const razorpaySignature = req.headers["x-razorpay-signature"];

// //   if (calculatedSignature === razorpaySignature) {
// //     console.log("Request is legit");
// //     const { order_id, status, userId } = req.body;

// //     if (status === "paid") {
// //       // Payment status is "paid" (assuming "paid" indicates a successful payment)

// //       // You can now store userId and orderId in your MongoDB database
// //       // Example: Create a new membership record with userId and orderId
// //       const membershipData = {
// //         userId,
// //         orderId: order_id,
// //       };

// //       // Create a new membership record in the database
// //       try {
// //         const membership = await Membership.create(membershipData);
// //         console.log("Membership created:", membership);
// //       } catch (error) {
// //         console.error("Error creating membership:", error);
// //       }
// //     }

// //     // Respond to the webhook request (e.g., return a 200 OK response)
// //     return res.status(200).json({
// //       message: "OK",
// //     });
// //   } else {
// //     return res.status(403).json({ message: "Invalid" });
// //   }
// // };

// var razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// // app.post("/razorpay",
// const razorPayment = async (req, res) => {
//   const payment_capture = 1;
//   const { amount, currency } = req.body;

//   // Extract the JWT token from the Authorization header
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       // Extracting the token from the authorization header.
//       token = req.headers.authorization.split(" ")[1];

//       // Verifying the token using the JWT_KEY and decoding its payload.
//       const decode = jwt.verify(token, process.env.JWT_KEY);

//       // Fetching the user data (excluding password) from the database based on the decoded user id.
//       user = await userModel.findById(decode.id).select("-password");

//       // Define the packages and their prices
//       // const packages = [
//       //   { name: "Package 1", price: 199 },
//       //   { name: "Package 2", price: 299 },
//       // ];

//       // // Calculate the total price based on the selected packages
//       // const selectedPackages = ["Package 1", "Package 2"]; // Example selected packages
//       // const totalPrice = packages
//       //   .filter((package) => selectedPackages.includes(package.name))
//       //   .reduce((total, package) => total + package.price, 0);

//       const options = {
//         amount: totalPrice * 100, // Convert total price to the smallest currency unit
//         currency,
//         receipt: shortid.generate(),
//         payment_capture,
//         notes: {},
//       };
//       const response = await razorpay.orders.create(options);
//       console.log(response);

//   try {
//     const response = await razorpay.orders.create(options);
//     console.log(response);

//       /// Extract payment information from the response
//       const paymentDetails = {
//         razorpay_order_id: response.id,
//         amount: response.amount,
//         currency: response.currency,
//         receipt: response.receipt,
//         entity: response.entity,
//         status: response.status,
//         user: response.user,
//       };

//       // Create a new Payment document and save it
//       const newPayment = new paymentModel(paymentDetails);
//       await newPayment.save();

//       // Send the order_id to the frontend
//       res.status(200).json({
//         id: response.id,
//         currency: response.currency,
//         amount: response.amount,
//         order_id: response.id, // Include order_id in the response
//         user: response.user,
//       });
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ error: "Payment creation failed" });
//     }
//   }

//   //app.post("/capture-payment",
//   //app.post("/capture-payment",
//   const paymentCapture = async (req, res) => {
//     const { order_id, paymentId } = req.body;

//     try {
//       const order = await razorpay.orders.fetch(order_id);

//       if (!order) {
//         console.log("Order not found:", order_id);
//         return res.status(400).json({
//           error: "The provided order ID does not exist or is invalid",
//         });
//       }

//       if (order.status === "captured") {
//         console.log("Payment has already been captured for order:", order_id);
//         return res.status(200).json({
//           message: "Payment has already been captured",
//         });
//       } else {
//         const amountInPaisa = Math.round(order.amount);
//         await razorpay.payments.capture(paymentId, amountInPaisa);

//         console.log("Payment captured successfully for order:", order_id);
//         return res.status(200).json({
//           message: "Payment captured successfully",
//         });
//       }
//     } catch (error) {
//       console.error("Payment capture error:", error);
//       return res.status(500).json({ error: "Payment capture failed" });
//     }
//   };

//   const fetchOrder = async (req, res) => {
//     const order_id = req.body; // Replace with the actual order ID you want to fetch

//     razorpay.orders.fetch(order_id, function (error, order) {
//       if (error) {
//         console.error(error);
//         // Handle the error, e.g., return an error response
//       } else {
//         console.log("Fetched Order:", order);

//         // Process the order data, e.g., return it in the response
//       }
//     });
//   };
// };
// module.exports = { razorPayment, verification, paymentCapture, fetchOrder };
