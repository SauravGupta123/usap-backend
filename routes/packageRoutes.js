const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");

router.post("/create-packages", packageController.createPackage);

router.get("/packagesByID/:id", packageController.getPackageById);
router.get("/allPackages", packageController.getAllPackages);

router.put("/updatePackages/:id", packageController.updatePackageById);
router.delete("/deletePackages/:id", packageController.deletePackageById);

router.get("/packages/search/:name", packageController.searchPackageByName);

module.exports = router;
