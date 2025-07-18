const express = require("express");
const router = express.Router();

const upiController = require("../controllers/upiController");

router.post("/upiCreatePayment", upiController.createPayment);

module.exports = router;
