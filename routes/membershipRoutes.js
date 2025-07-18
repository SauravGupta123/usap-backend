const express = require("express");
const router = express.Router();
const membershipController = require("../controllers/membershipConroller");

router.post("/register-member", membershipController.registerMember);
router.get(
  "/get-membershipDetails/:email",
  membershipController.getMembershipDetails
);
router.put(
  "/update-memberData/:email",
  membershipController.updateMemberDetails
);
router.post(
  "/ispaymentCompleted/:email",
  membershipController.markPaymentCompleted
);

module.exports = router;
