const express = require("express");

// Import the Package model
const Package = require("../models/packageModel"); // Update with the correct path

// Create a New Package (POST)
const createPackage = async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    const savedPackage = await newPackage.save();
    return res
      .status(201)
      .json({ message: "Package created successfully", data: savedPackage });
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Failed to create a package", message: error.message });
  }
};

// Get a Package by ID (GET)
const getPackageById = async (req, res) => {
  try {
    const package = await Package.findOne({ package_id: req.params.id });
    if (package) {
      return res.status(200).json({ message: "Package found", data: package });
    } else {
      return res.status(404).json({ message: "Package not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error fetching package", message: error.message });
  }
};

// Get All Packages (GET)
const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    return res
      .status(200)
      .json({ message: "Packages retrieved successfully", data: packages });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error fetching packages", message: error.message });
  }
};

// Update Package Information (PUT)
const updatePackageById = async (req, res) => {
  try {
    const updatedPackage = await Package.findOneAndUpdate(
      { package_id: req.params.id },
      req.body,
      { new: true }
    );
    if (updatedPackage) {
      return res
        .status(200)
        .json({
          message: "Package updated successfully",
          data: updatedPackage,
        });
    } else {
      return res.status(404).json({ message: "Package not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error updating package", message: error.message });
  }
};

// Delete a Package (DELETE)
const deletePackageById = async (req, res) => {
  try {
    const deletedPackage = await Package.findOneAndRemove({
      package_id: req.params.id,
    });
    if (deletedPackage) {
      return res.status(204).json({ message: "Package deleted successfully" });
    } else {
      return res.status(404).json({ message: "Package not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error deleting package", message: error.message });
  }
};

// Search for Packages by Name (GET)
const searchPackageByName = async (req, res) => {
  try {
    const packages = await Package.find({ package_name: req.params.name });
    return res.status(200).json({ message: "Packages found by name", data: packages });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error searching for packages", message: error.message });
  }
};

module.exports = {
  searchPackageByName,
  deletePackageById,
  updatePackageById,
  getAllPackages,
  getPackageById,
  createPackage,
};
