const express = require('express');
const router = express.Router();
const { 
  createEnquiry, 
  getAllEnquiries, 
  markEnquiryAsFulfilled, 
  getFulfilledEnquiriesByIds ,
 submitFeedback ,
 assignRequest,
 getEnquiryByAdmin
  // Import the new controller
} = require('../controllers/enquiryController');

// Route to create a new enquiry
router.post('/generateRequest', createEnquiry);

// Route to get all enquiries
router.get('/getAllEnquiries', getAllEnquiries);

// Route to mark an enquiry as fulfilled based on enquiryId
router.put('/complete/:enquiryId', markEnquiryAsFulfilled);

// New route to fetch fulfilled enquiries by array of enquiry IDs
router.post('/getFulfilledRequests', getFulfilledEnquiriesByIds);
router.post ('/assignRequest', assignRequest); // New route to assign a request
router.post ('/getEnquiryByAdmin', getEnquiryByAdmin); // New route to get enquiries by admin
router.post('/:enquiryId/feedback', submitFeedback); // New feedback route

module.exports = router;
