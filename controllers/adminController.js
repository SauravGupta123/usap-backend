// controllers/adminController.js
const Admin = require('../models/admin.model');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  try {
    // Extract required info from req.params
    const { userName, name, email, password,category, secretKey } = req.query;
    console.log(req.query);

    // Check if any required fields are missing
    if (!userName || !password || !secretKey || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide userName, email, password, and secretKey.'
      });
    }

    // Verify secret key with environment variable
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Secret key does not match.'
      });
    }

    // Check if admin already exists
    let admin = await Admin.findOne({ userName });
    if (admin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this userName already exists.'
      });
    }
    let newCategory="NA";
    if(category){
      newCategory=category;
    }

    // Create a new admin
    admin = new Admin({ userName, password, email, name ,newCategory });
    await admin.save();

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.ADMIN_SECRET_KEY, { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      token
    });
  } catch (error) {
    console.error('Error during admin signup:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Find admin by either userName or email
    const admin = await Admin.findOne({
      $or: [{ userName: identifier }, { email: identifier }]
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Check if the password is correct
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.ADMIN_SECRET_KEY, { expiresIn: '1d' });

    res.status(200).json({ success: true, message: { token, userName: admin.userName, adminType: admin.adminType } });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllSubAdmins = async (req, res) => {
  try {
    // Find all users with adminType 'subAdmin'
    const subAdmins = await Admin.find({ adminType: 'subAdmin' });

    // If no sub-admins found, return an appropriate message
    if (subAdmins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sub-admins found',
      });
    }

    // If sub-admins found, return them in the response
    res.status(200).json({
      success: true,
      message: 'Sub-admins fetched successfully',
      subAdmins,
    });
  } catch (error) {
    console.error('Error during fetching subAdmins:', error);

    // Return server error response
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

const getAdminDetails = async (req, res) => {
  try {
    console.log(req.body);
    const {id}=req.body;
    if (!id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin not found',
      });
    }
    console.log(req.id);
    // Find admin by id
    const admin = await Admin.findOne({userName:id});

    // If admin not found, return an appropriate message
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // If admin found, return it in the response
    res.status(200).json({
      success: true,
      message: 'Admin fetched successfully',
      admin,
    });
  } catch (error) {
    console.error('Error during fetching admin:', error);

    // Return server error response
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
}

const updatePassword = async (req, res) => {
  try {
    const { userName, newPassword,secretKey } = req.body;
    
    // Check if required fields are provided
    if (!userName || !newPassword || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide id and newPassword.'
      });
    }
    if( secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Secret key does not match.'
      });
    }

    // Find admin by id
    const admin = await Admin.findOne({ userName });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    // Update password
    admin.password = newPassword;
    await admin.save();
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  }
  catch (error) {
    console.error('Error during password update:', error);
    res.status(500).json({
      success: false,
      message: error
    });
  }
}



module.exports = { signup, login, getAllSubAdmins, getAdminDetails , updatePassword};