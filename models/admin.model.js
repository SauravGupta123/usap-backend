// models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Admin schema
const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  email:{
    required:true,
    type: String,
  },
  name:{
    type: String,
    required: true
  },
  adminType:{
    type: String,
    default: 'subAdmin'
  },
  category:{
    type:String,
    default:"NA"
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash the password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare the password for login
adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
