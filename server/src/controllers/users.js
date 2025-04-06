const User = require("../models/User");
const Guide = require("../models/Guide");
const Tourist = require("../models/Tourist");
const VehicleOwner = require("../models/VehicleOwner");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");
const bcrypt = require("bcryptjs");

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let userProfile;

    // Get base user info
    const user = await User.findById(req.user.id).select("-password");

    // Get role-specific profile
    switch (user.user_type) {
      case "tourist":
        userProfile = await Tourist.findOne({ user: req.user.id });
        break;
      case "guide":
        userProfile = await Guide.findOne({ user: req.user.id });
        break;
      case "vehicle_owner":
        userProfile = await VehicleOwner.findOne({ user: req.user.id });
        break;
    }

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        profile: userProfile,
      },
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, phone_number } = req.body;

  try {
    // Build update object
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (phone_number) updateFields.phone_number = phone_number;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err.message);
    // Check if error is due to invalid ObjectId
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    next(err);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const file = req.files.image;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "sri-lanka-tourism/profile-pictures",
      public_id: `user-${req.user.id}`,
    });

    // Update user profile with new image
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profile_pic: result.secure_url },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};
