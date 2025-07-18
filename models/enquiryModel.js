const mongoose = require('mongoose');

// Create a schema for Enquiry
const enquirySchema = new mongoose.Schema({
  enquiryId: {
    type: Number,
    unique: true
  },
  requestedBy: {
    isafId: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  requestFor: {
    type: String,
    required: true
  },
  assignedTo: {
    type:String,
    default: "superAdmin"
  },
  assignedAt:{
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },

  isFulfilled: {
    type: Boolean,
    default: false // Default value is false since it's not fulfilled initially
  },
  message: {
    type: String,
    default: null
  },
  
  feedback: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null // Default value can be null until set
  }
}, {
  timestamps: true,
});

// Model to track the last used enquiryId
const EnquiryCounter = mongoose.model('EnquiryCounter', new mongoose.Schema({
  _id: String,
  sequence_value: { type: Number, default: 100 } // Start from 100
}));

// Function to get the next enquiryId
async function getNextEnquiryId() {
  const counter = await EnquiryCounter.findByIdAndUpdate(
    { _id: 'enquiryId' },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
}

module.exports = { Enquiry: mongoose.model('Enquiry', enquirySchema), getNextEnquiryId };
