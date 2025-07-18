// userController.js
const  multer = require('multer');
const path= require('path');
const fs = require('fs');
const User = require('../models/userModel');
// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-images';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 30 * 1024 * 1024 // 3MB limit
  },
  fileFilter: fileFilter
});

 const uploadProfileImage = async (req, res) => {
  try {
    // The upload middleware will handle the file upload
    upload.single('profileImage')(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const userId = req.body.userId;
      if (!userId) {
        // Clean up the uploaded file if user ID is missing
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      try {
        // Update user's profile picture in database
        const user = await User.findOne({ email: userId });
        // console.log('user',user); 
        if (!user) {
          // Clean up the uploaded file if user not found
          fs.unlinkSync(req.file.path);
          return res.status(404).json({ message: 'User not found' });
        }

        // If user already has a profile picture, delete the old one
        if (user.picture && user.picture !== 'default-profile-picture.png') {
          const oldPicturePath = path.join('uploads/profile-images', path.basename(user.picture));
          if (fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
          }
        }

        // Update user's picture field with the new file path
        const imageUrl = `${process.env.BASE_URL}/uploads/profile-images/${req.file.filename}`;
        user.picture = imageUrl;
        await user.save();

        res.status(200).json({
          message: 'Profile picture updated successfully',
          picture: imageUrl
        });
      } catch (error) {
        // Clean up the uploaded file if database update fails
        fs.unlinkSync(req.file.path);
        throw error;
      }
    });
  } catch (error) {
    console.error('Error in uploadProfileImage:', error);
    res.status(500).json({ message: 'Server error while uploading profile image' });
  }
};

module.exports = {uploadProfileImage};

// Add this to your existing routes file (routes/userRoutes.js)
/*
import express from 'express';
const router = express.Router();
import { uploadProfileImage } from '../controllers/userController.js';

router.post('/uploadProfileImage', uploadProfileImage);

export default router;
*/