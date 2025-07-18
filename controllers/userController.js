const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const validator = require('validator');
const GenerateSignature = require('../utils/generateToken');
const generateISAFid = require('../utils/generateISAF_id');
const crypto = require('crypto');
const { GeneratePassword, GenerateSalt, ValidatePassword } = require("../utils");
const {sendMail} = require('../utils/sendEmail');

require('dotenv').config();


//register by email
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, email, password, membershipType, phoneNo, countryResiding } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !membershipType || !countryResiding) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Validate the email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Generate password hash and salt
    const salt = await GenerateSalt();
    const hashedPassword = await GeneratePassword(password, salt);

    // Generate ISAFid based on the country and membership type
    const ISAFid = await generateISAFid(countryResiding, membershipType);

    // If phone number is not provided, set it to 'NA'
    const userPhoneNo = phoneNo ? phoneNo : 'NA';

    // Create a new user with empty `fulfilledQueries` and `pendingQueries`
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      salt,
      membershipType,
      countryResiding,
      ISAFid,
      phoneNo: userPhoneNo,
      fulfilledQueries: [], // Initialize as empty array
      pendingQueries: [],   // Initialize as empty array
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT token
    const token = await GenerateSignature({ email: newUser.email, _id: newUser._id });

    // Return the created user's details and token
    return res.status(200).json({
      success: true,
      message: {
        id: newUser._id,
        token,
        firstname: newUser.firstName,
        lastname: newUser.lastName,
        email: newUser.email,
        ISAFid: newUser.ISAFid,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
});


//register using gooogle

const createUser = asyncHandler(async (req, res) => {
  try {
    const { googleId, firstName, lastName, email, countryResiding, membershipType,picture } = req.body;
    console.log("req body", req.body);
    
    // Check if user already exists
    let user = await User.findOne({ email: email });

    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate ISAFid
    const ISAFid = await generateISAFid(countryResiding, membershipType);
   
    // Create new user
    user = new User({
      googleId,
      firstName,
      lastName,
      email,
      picture,
      countryResiding,
      membershipType,
      password: crypto.randomBytes(4).toString("hex"), // Generate a random password for Google-authenticated users
      ISAFid, // Add ISAFid to the user
    });
    console.log("user", user);  
    await user.save();

    const token = await GenerateSignature({
      email: user.email,
      _id: user._id,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        picture: user.picture,
        countryResiding: user.countryResiding,
        membershipType: user.membershipType,
        ISAFid: user.ISAFid, // Include ISAFid in the response
      },
      token,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === 11000) {
      // Handle duplicate key error
      res.status(400).json({ success: false, message: 'Duplicate key error. User or ISAF ID may already exist.' });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});


const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await User.findOne({ email: email });
      
      // Check if the user exists
      if (!user) {
        return res.status(400).json({ success: false, message: 'User with this email not found' });
      }
      
      // Compare the provided password with the hashed password in the database
      const validPassword = await ValidatePassword(
        password,
        user.password,
        user.salt
      );

      if (!validPassword) {
        return res.status(400).json({ success: false, message: 'Incorrect Email or Password' });
      }
      const token = await GenerateSignature({ email: email, _id: user._id });
      // Successful login
      return res.status(200).json({
        success: true,
        message: {
          name: user.firstName + ' ' + user.lastName,
          token: token,
          email: user.email,
          picture: user.picture,
        }
      });
    } else {
      return res.status(400).json({ message: 'All fields are required' });
    }


  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

const getUser = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id; // Corrected parameter name
    const user = await User.findOne({ email: id }); // Searching by ISAFid
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user); // Return user details if found
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
);


const changeUserStatus = async (req, res) => {
  const { userId, status } = req.body;

  if (!userId || !status) {
    return res.status(400).json({ message: 'User ID and status are required' });
  }

  try {
    const validStatuses = ['active', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user status
    user.userStatus = status;
    await user.save();
    console.log(`Sending mail for change user status for ${status} to ${user.email}`);
    // Send email when status is changed to 'active'
    if (status === 'active') {
      try {
        await sendMail(user);
        console.log('Email sent successfully');
      } catch (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'User status updated, but failed to send email' });
      }
    }

    return res.status(200).json({ message: `User ${status} successfully` });
  } catch (error) {
    console.error('Error changing user status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email not found' });
    }

    // Validate password (this is optional, you can add more checks here)
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Generate salt and hash the new password
    const salt = await GenerateSalt(); // Assuming GenerateSalt is a custom function
    const hashedPassword = await GeneratePassword(password, salt); // Assuming GeneratePassword is a custom function

    // Update user's password and save
    user.password = hashedPassword;
    user.salt = salt;
    await user.save();

    // Return success response
    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    // Log error and return server error response
    console.error('Error resetting password:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while resetting password' });
  }
};


const updateProfile = async (req, res) => {
  const { ISAFid, phoneNo, birthYear, birthMonth, birthDay } = req.body;

  try {
    // Validate inputs
    if (!ISAFid) {
      return res.status(400).json({ 
        success: false, 
        message: 'ISAF ID is required' 
      });
    }

    let updateData = {};
    
    // Update phone number if provided
    if (phoneNo) {
      updateData.phoneNo = phoneNo;
    }

    // Update date of birth if all components are provided
    if (birthYear && birthMonth && birthDay) {
      // Convert inputs to numbers and validate
      const year = parseInt(birthYear);
      const month = parseInt(birthMonth) - 1; // Convert to 0-based month
      const day = parseInt(birthDay);

      const dateOfBirth = new Date(year, month, day);
      
      // Validate the date is real and reasonable
      if (dateOfBirth.toString() === 'Invalid Date' || 
          dateOfBirth.getFullYear() !== year || 
          dateOfBirth.getMonth() !== month || 
          dateOfBirth.getDate() !== day) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date of birth'
        });
      }

      // Validate the date is not in the future
      if (dateOfBirth > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth cannot be in the future'
        });
      }

      updateData.dateOfBirth = dateOfBirth;
    } else if (birthYear || birthMonth || birthDay) {
      // If any date component is provided but not all
      return res.status(400).json({
        success: false,
        message: 'Please provide complete date of birth (year, month, and day)'
      });
    }

    // Update user profile
    const updatedUser = await User.findOneAndUpdate(
      { ISAFid },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format the date for response
    const formattedResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: {
        ISAFid: updatedUser.ISAFid,
        phoneNo: updatedUser.phoneNo,
        dateOfBirth: updatedUser.dateOfBirth,
        formattedDate: updatedUser.dateOfBirth ? new Date(updatedUser.dateOfBirth).toISOString() : null
      }
    };

    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};





module.exports = {
registerUser,
loginUser,
createUser, // Export the new function
getUser,
getAllUsers,
changeUserStatus,
resetPassword,
updateProfile,
};