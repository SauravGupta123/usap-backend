const Membership = require("../models/membershipModel");

// Register a new member
async function registerMember(req, res) {
  const memberData = req.body;

  try {
    const newMember = new Membership(memberData);
    const savedMember = await newMember.save();
    savedMember.user_id = req.user._id;
    await savedMember.save();
    
    return res.status(201).json({
      success: true,
      message: "Member registered successfully",
      data: savedMember,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Get membership details by email
async function getMembershipDetails(req, res) {
  const email = req.params.email;

  try {
    const member = await Membership.findOne({ email }).exec();
    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    } else {
      return res.status(200).json({
        success: true,
        message: "Membership details retrieved successfully",
        data: member,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Update a member's details
async function updateMemberDetails(req, res) {
  const email = req.params.email;
  const updatedData = req.body;

  try {
    const updatedMember = await Membership.findOneAndUpdate(
      { email },
      updatedData,
      {
        new: true, // Return the updated document
      }
    ).exec();
    if (!updatedMember) {
      return res.status(404).json({ status: 404, message: "Member not found" });
    } else {
      res.status(200).json({
        status: 200,
        message: "Member details updated successfully",
        data: updatedMember,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
}

// Mark a member's payment as completed
async function markPaymentCompleted(req, res) {
  const email = req.params.email;

  try {
    const updatedMember = await Membership.findOneAndUpdate(
      { email },
      { paid: true, membership_Account_Created: "completed" },
      {
        new: true, // Return the updated document
      }
    ).exec();
    if (!updatedMember) {
      res.status(404).json({ status: 404, message: "Member not found" });
    } else {
      return res.status(200).json({
        status: 200,
        message: "Payment marked as completed",
        data: updatedMember,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
}

module.exports = {
  registerMember,
  markPaymentCompleted,
  updateMemberDetails,
  getMembershipDetails,
};
