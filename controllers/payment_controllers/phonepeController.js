const crypto = require("crypto");
const axios = require("axios");
var store = require('store');
var sha256 = require('sha256');
var uniqid = require('uniqid');

const {SALT_KEY, MERCHANT_ID, BASE_URL, CLIENT_URL} = require('../../config');
const User = require('../../models/userModel');
const Membership = require('../../models/membershipModel');
const { GetUserFromToken } = require('../../utils');
const paymentSchema = require("../../models/paymentModel");
const transactionSchema = require("../../models/transactionModel");
function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateRandomMUID() {
  return "MUID" + Date.now() + generateRandomString(4);
}

function generateRandomTransactionId() {
  return "T" + Date.now() + generateRandomString(6);
}

// Example usage:
const MUID = generateRandomMUID();
const TransactionId = generateRandomTransactionId();



//router.get('/pay', async function (req, res, next) {
  const Pay = async (req, res) => {

  const membership_id = req.query.membership_id;
  const userToken = req.query.token;

  const user = await GetUserFromToken(userToken);
  const membership = await Membership.findOne({membership_id: membership_id, user_id: user._id});
  if (!membership) {
    return res.status(400).send({
      message: "Error while making payment, please try again",
      success: false,
    });
  }
  //+++++++++++++++++++++++++++++++++++++++++++++++++++
  //Store IT IN DB ALSO
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  let tx_uuid = uniqid();
  store.set('uuid', { tx: tx_uuid });
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  let normalPayLoad = {
    "merchantId": MERCHANT_ID,
    "merchantTransactionId": tx_uuid,
    "merchantUserId": MERCHANT_ID,
    "amount": (membership.amount)*100,
    "redirectUrl": `${BASE_URL}/api/payment/pay-return-url/${MERCHANT_ID}/${tx_uuid}/${membership_id}`,
    "redirectMode": "REDIRECT",
    "callbackUrl": `${BASE_URL}/api/payment/pay-return-url/${MERCHANT_ID}/${tx_uuid}/${membership_id}`,
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }
  // let saltKey = 'b2864d31-d776-4d11-8e48-afdc8b037e7b';
  let saltIndex = 1
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++
  let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
  let base64String = bufferObj.toString("base64");
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++
  //console.log(base64String)
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++
  let string = base64String + '/pg/v1/pay' + SALT_KEY;
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++
  let sha256_val = sha256(string);
  let checksum = sha256_val + '###' + saltIndex;
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++
  //console.log(checksum);
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++
  axios.post('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
    'request': base64String
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'accept': 'application/json'
    }
  }).then(function (response) {
    res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
  }).catch(function (error) {
    res.render('index', { page_respond_data: JSON.stringify(error) });
  });


};
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
//PAY RETURN
//++++++++++++++++++++++++++++++++++++++++++++++++++++++
//router.all('/pay-return-url', async function (req, res) {
  const PayReturnurl = async (req, res) => {

  if (req.params.transactionId) {
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // 1.In the live please match the amount you get byamount you send also so that hacker can't pass static value.
    // 2.Don't take Marchent ID directly validate it with yoir Marchent ID
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //if (req.body.transactionId == store.get('uuid').tx && req.body.merchantId == 'PGTESTPAYUAT' && req.body.amount == 1000) {
    if (req.params.transactionId) {
      //+++++++++++++++++++++++++++++++++++++++++++++++++++++
      // let saltKey = 'b2864d31-d776-4d11-8e48-afdc8b037e7b';
      let saltIndex = 1
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++
      let surl = `https://api.phonepe.com/apis/hermes/pg/v1/status/${MERCHANT_ID}/` + req.body.transactionId;
      //+++++++++++++++++++++++++++++++++++++++++++++++++++++
      let string = `/pg/v1/status/${MERCHANT_ID}/` + req.params.transactionId + SALT_KEY;
      //+++++++++++++++++++++++++++++++++++++++++++++++++++++
      let sha256_val = sha256(string);
      let checksum = sha256_val + '###' + saltIndex;
      //+++++++++++++++++++++++++++++++++++++++++++++++++++++
      //console.log(checksum);
      //+++++++++++++++++++++++++++++++++++++++++++++++++++++
      axios.get(surl, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': MERCHANT_ID,
          'accept': 'application/json'
        }
      }).then(async function (response) {

        console.log(response);

        const membership = await Membership.findById(req.params.membership_id);
        const user = await User.findById(membership.user_id);
        

        if (response.data.success === true) {
          // Assuming the payment details schema is defined in your application
          const paymentDetails = new paymentSchema({
            orderID: req.params.transactionId, // Use a suitable field for the orderID
            gatewayid: response.data.data.transactionId, // Use a suitable field for the gateway ID
            membership_id: membership._id,
            user_id: user._id,
            paymentMethod: "phonepe", // Assuming PhonePe payment
            paymentStatus: "Success", // Update the status based on the response
            paymentAmount: response.data.data.amount/100,
            gatewayResponse: JSON.stringify(response.data),
          });
    
          // Save the payment details to MongoDB
          await paymentDetails.save();

          membership.paid = true;
          membership.paidAt = Date.now();
          membership.status = 'Completed';
          await membership.save();
    
          const url = `${CLIENT_URL}/payment/success`; ///change according to production need
          return res.redirect(url);
        } else {

          const paymentDetails = new paymentSchema({
            orderID: req.params.transactionId, // Use a suitable field for the orderID
            gatewayid: response.data.data.transactionId, // Use a suitable field for the gateway ID
            membership_id: membership._id,
            user_id: user._id,
            paymentMethod: "phonepe", // Assuming PhonePe payment
            paymentStatus: "Failed", // Update the status based on the response
            paymentAmount: response.data.data.amount/100,
            gatewayResponse: JSON.stringify(response.data),
          });

          await paymentDetails.save();

          const url = `${CLIENT_URL}/payment/failure`; ///change according to production need
          return res.redirect(url);
        }
        //+++++++++++++++++++++++++++++++++++++++++++++++++
        //DB OPERATION
        //+++++++++++++++++++++++++++++++++++++++++++++++++
        //{PLease add your code.}
        //+++++++++++++++++++++++++++++++++++++++++++++++++
        //RETURN TO VIEW
        //+++++++++++++++++++++++++++++++++++++++++++++++++
        //console.log(response);
        // return res.status(200).send({
        //   message: "Success",
        //   success: true,
        // });
      }).catch(function (error) {
        console.log(error)
        const url = `${CLIENT_URL}/payment/failure`;
        return res.redirect(url);
      });
    } else {
      console.log(error)
        const url = `${CLIENT_URL}/payment/failure`;
        return res.redirect(url);
    }
  } else {
      console.log(error)
      const url = `${CLIENT_URL}/payment/failure`;
      return res.redirect(url);
  }
};

const newPayment = async (req, res) => {

  try {
    console.log(req.query.amount)
    const merchantTransactionId = TransactionId;
    const data = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: TransactionId,
      merchantUserId: MUID,
      // orderID: "larf_PAYMENT",
      // name: "Jugal LARF PAYMENT",
      amount: req.query.amount * 100, //in paise
      // redirectUrl: `http://localhost:5000/api/payment/phonepe/status/${merchantTransactionId}`,
      redirectUrl: `${BASE_URL}/api/payment/phonepe/status/${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        // return res.redirect(
        //   response.data.data.instrumentResponse.redirectInfo.url
        // );
        return res.status(200).send({
          message: response.data,
          success: true,
        });
     
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (error) {
    return res.status(200).send({
      message: error.message,
      success: false,
    });
  }
};

const checkStatusVerify = async (req, res) => {
  console.log('checkSTatus res',res);
  const merchantTransactionId = res.req.body.transactionId;
  const merchantId = res.req.body.merchantId;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  try {
    // CHECK PAYMENT STATUS
    const response = await axios.request(options);
    console.log('axios res',response)

    if (response.data.success === true) {
      // Assuming the payment details schema is defined in your application
      const paymentDetails = new paymentSchema({
        orderID: merchantTransactionId, // Use a suitable field for the orderID
        gatewayid: merchantId, // Use a suitable field for the gateway ID
        paymentMethod: "phonepe", // Assuming PhonePe payment
        paymentStatus: "Success", // Update the status based on the response
        paymentAmount: response.data.data.amount,
        gatewayResponse: response.data,
      });

      // Save the payment details to MongoDB
      await paymentDetails.save();

      const url = `${CLIENT_URL}/payment/success`; ///change according to production need
      return res.redirect(url);
    } else {
      //const url = `${process.env.FRONT_END_BASE_URL}/payment/failue`; ///change according to production need
      return res.status(200).send({
        message: "Payment expried please try again",
        success: false,
      });
     // return res.redirect(url);
    }

    return 
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

module.exports = {
  newPayment,
  checkStatusVerify,
  PayReturnurl,
  Pay
};
