const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  ISAFid: {
    type: String,
    unique: true,
  },
  googleId: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    default: 'NA',
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  picture: {
    type: String,
    default: null,
  },
  countryResiding: {
    type: String,
    required: true,
  },
  userStatus: {
    type: String,
    default: "pending",
  },
  membershipType: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
  },
  year: {
    type: String,
  },
  scholarship: {
    type: String,
  },
  scholarshipType: {
    type: String,
  },
  residenceCardType: {
    type: String,
  },
  totalEnquiry: {
    type: Number,
    default: 0,
  },
  fulfilledQueries: {
    type: Array,
    default: []
  },
  pendingQueries: {
    type: Array,
    default: []
  },
  salt: {
    type: String,
  }
},
{
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;