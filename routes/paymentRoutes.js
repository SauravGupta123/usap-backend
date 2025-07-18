const express = require("express");
const router = express.Router();
const phonePeController = require("../controllers/payment_controllers/phonepeController");

router.get("/phonepe", phonePeController.newPayment);

router.post(
  "/phonepe/status/:transactionId",
  phonePeController.checkStatusVerify
);

router.get("/pay", phonePeController.Pay);

router.all(
  "/pay-return-url/:merchantId/:transactionId/:membership_id",
  phonePeController.PayReturnurl
);



module.exports = router;
