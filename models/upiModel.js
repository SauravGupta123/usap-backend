const mongoose = require("mongoose");

const UpiSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    user_email: {
      type: String,
      required: true,
    },
    app: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    transactionNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UPIPayment = mongoose.model("QRPayment", UpiSchema);

module.exports = UPIPayment;
