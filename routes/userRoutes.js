const express = require("express");
const router = express.Router();
const { registerUser, loginUser, createUser,getUser,getAllUsers,changeUserStatus,resetPassword,updateProfile } = require("../controllers/userController");
const {uploadProfileImage}= require("../controllers/uploadImageControlller");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/createUser', createUser); // Use the function from the controller
router.get('/getUser/:id', getUser); // Use the function from the controller
router.get('/getAllUsers', getAllUsers); // Use the function from the controller
router.post('/changeUserStatus', changeUserStatus); // Use the function from the controller
router.post('/resetPassword', resetPassword); // Use the function from the controller
router.put('/updateProfile', updateProfile); // Use the function from the controller
router.post('/uploadProfileImage', uploadProfileImage); // Use the function from the controller

module.exports = router;
