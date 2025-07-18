const { Enquiry, getNextEnquiryId } = require('../models/enquiryModel');
const User = require('../models/userModel'); // Import the User model
const { sendMailToAdmin, sendRequestResolvedMail } = require('../utils/sendEmail');
// @desc    Create an enquiry
// @route   POST /api/enquiry
// @access  Public
const createEnquiry = async (req, res) => {
  const { email, degree, year, scholarship, scholarshipType, residenceCardType, requestFor,message } = req.body;

  // Validate required fields
  if (!requestFor) {
    return res.status(400).json({
      error: 'Please fill in all required fields: email, residenceCardType, and requestFor.'
    });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const { ISAFid } = user;

    // Update user details if provided
    const updateFields = {};
    if (degree) updateFields.degree = degree;
    if (year) updateFields.year = year;
    if (scholarship) updateFields.scholarship = scholarship;
    if (scholarshipType) updateFields.scholarshipType = scholarshipType;
    if (residenceCardType) updateFields.residenceCardType = residenceCardType;

    if (Object.keys(updateFields).length > 0) {
      await User.updateOne({ email }, { $set: updateFields });
    }

    // Get the next enquiryId
    const enquiryId = await getNextEnquiryId();

    // Create a new enquiry document
    const newEnquiry = new Enquiry({
      enquiryId,
      requestedBy: {
        isafId: ISAFid,
        email: user.email
      },
      requestFor,
      message,
      isFulfilled: false // By default, it's not fulfilled
    });

    await newEnquiry.save();

    try {
      console.log('Sending mail to admin');
      const mailResponse= await sendMailToAdmin(user, newEnquiry);
      console.log("mailResponse :",mailResponse);
      
    } catch (error) {
      console.error('Error sending mail to admin:', error);
      
    }

    // Add the new enquiry to the user's pendingQueries array
    await User.updateOne(
      { email },
      { 
        $push: { pendingQueries: { enquiryId, requestFor, isFulfilled: false } },
        $inc: { totalEnquiry: 1 }
      }
    );

    res.status(201).json({ message: 'Enquiry submitted successfully', enquiryId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllEnquiries = async (req, res) => {
  console.log('getAllEnquiries');
  try {
    // Fetch all enquiries from the database
    const enquiries = await Enquiry.find();

    if (!enquiries) {
      return res.status(404).json({ message: 'No enquiries found' });
    }

    // Return the enquiries in the response
    res.status(200).json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const markEnquiryAsFulfilled = async (req, res) => {
  const { enquiryId } = req.params;
  console.log('enquiryId:', enquiryId);

  try {
    // Find the enquiry by its custom integer enquiryId and update its status to fulfilled
    const enquiry = await Enquiry.findOneAndUpdate(
      { enquiryId: parseInt(enquiryId, 10) }, // Convert enquiryId from string to integer
      { isFulfilled: true },
      {completedAt: Date.now()},
      { new: true }
    );
    
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    const isafId = enquiry.requestedBy?.isafId;
    // Find the user who requested this enquiry
    const user = await User.findOne({ 'ISAFid': isafId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove the enquiry from the user's pendingQueries and add it to fulfilledQueries
    await User.updateOne(
      { email: user.email },
      {
        $pull: { pendingQueries: { enquiryId } },
        $push: { fulfilledQueries: { enquiryId, requestFor: enquiry.requestFor, isFulfilled: true } }
      }
    );
    console.log('enquiry completed. Sending mail to user');
    // sendRequestResolvedMail(user, enquiry);
    res.status(200).json({ message: 'Enquiry marked as fulfilled', enquiry });
  } catch (error) {
    console.log('Error completing enquiry:', error);
    res.status(500).json({ message: 'Error completing enquiry', error });
  }
};


const getFulfilledEnquiriesByIds = async (req, res) => {
  const { enquiryIds } = req.body; // Array of enquiry IDs from the frontend

  if (!enquiryIds || !Array.isArray(enquiryIds) || enquiryIds.length === 0) {
    return res.status(400).json({ message: 'No enquiry IDs provided' });
  }

  try {
    // Fetch all enquiry details corresponding to the provided IDs
    const fulfilledEnquiries = await Enquiry.find({
      enquiryId: { $in: enquiryIds }
    });

    if (!fulfilledEnquiries || fulfilledEnquiries.length === 0) {
      return res.status(404).json({ message: 'No enquiries found for the provided IDs' });
    }

    res.status(200).json(fulfilledEnquiries);
  } catch (error) {
    console.error('Error fetching fulfilled enquiries:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


const submitFeedback = async (req, res) => {
  const { enquiryId } = req.params; // Extracting enquiryId from the URL
  const { rating, feedback } = req.body; // Extracting rating and feedback from request body

  // Validate required fields
  if (rating === undefined || feedback === undefined) {
    return res.status(400).json({
      error: 'Rating and feedback are required fields.',
    });
  }

  try {
    // Find the enquiry by its enquiryId and update its feedback and rating
    const enquiry = await Enquiry.findOneAndUpdate(
      { enquiryId: parseInt(enquiryId, 10) }, // Convert enquiryId from string to integer
      { feedback, rating }, // Update the feedback and rating fields
      { new: true } // Return the updated enquiry document
    );

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.status(200).json({ message: 'Feedback submitted successfully', enquiry });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignRequest = async (req, res) => {
  const { enquiryId, userName } = req.body;

  if (!enquiryId || !userName) {
    return res.status(400).json({ message: 'Enquiry ID and assigned user are required.' });
  }

  try {
    // Find the enquiry and update the assignedTo field
    const request = await Enquiry.findOneAndUpdate(
      { enquiryId: parseInt(enquiryId, 10) }, // Ensure enquiryId is treated as an integer
      { assignedTo: userName, assignedAt: Date.now() }, // Update the assignedTo and assignedAt fields
      { new: true } // Return the updated document
    );

    if (!request) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.status(200).json({ message: 'Request assigned successfully', request });
  } catch (err) {
    console.error('Error assigning request:', err);
    res.status(500).json({ message: 'Problem in assigning request', error: err.message });
  }
};



const getEnquiryByAdmin = async (req, res) => {
  const { userName } = req.body;

  // Validate that userName is provided
  if (!userName) {
    return res.status(400).json({ message: 'userName is required' });
  }

  try {
    // Find all enquiries assigned to the user
    const enquiries = await Enquiry.find({ assignedTo: userName });

    // If no enquiries are found
    if (!enquiries) {
      return res.status(404).json({ message: 'No enquiries found for this user' });
    }

    // Return the array of assigned enquiries
    res.status(200).json({ message: 'Enquiries fetched successfully', enquiries });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  createEnquiry,
  getAllEnquiries,
  markEnquiryAsFulfilled,
  getFulfilledEnquiriesByIds,  // Export the new controller
  submitFeedback,
  assignRequest,
  getEnquiryByAdmin
};