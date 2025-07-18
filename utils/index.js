const bcrypt = require("bcrypt");
const {JWT_KEY} = require("../config");
require('dotenv').config();
const jwt = require('jsonwebtoken');

(module.exports.GeneratePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
});

(module.exports.GenerateSalt = async () => {
    return await bcrypt.genSalt();
});

(module.exports.GenerateSignature = async (payload) => {
    return await jwt.sign(payload, JWT_KEY, { expiresIn: "7d" });
  });

(module.exports.GetUserFromToken = async(token) => {
  const signature = token;
  const payload =  jwt.verify(signature, JWT_KEY);
  return payload;
})

module.exports.ValidatePassword = async (
    enteredPassword,
    savedPassword,
    salt
  ) => {
    return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
  };

(module.exports.ValidateSignature = async (req) => {
  console.log(req.get("Authorization"));
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], JWT_KEY);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
});
