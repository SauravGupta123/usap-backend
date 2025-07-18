// routes/admin.js
const express = require('express');
const router = express.Router();
const { signup, login,getAllSubAdmins,getAdminDetails, updatePassword } = require('../controllers/adminController');

// Route for admin signup
router.get('/signup', signup);


router.post('/login', login);
router.get('/getAllSubAdmins',getAllSubAdmins);
router.post('/getAdminDetails',getAdminDetails);
router.post('/updatePassword',updatePassword);


module.exports = router;
