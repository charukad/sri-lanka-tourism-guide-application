const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const usersController = require("../../controllers/users");
const authMiddleware = require("../../middleware/auth");

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get("/me", authMiddleware, usersController.getMe);

// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put(
  "/me",
  [
    authMiddleware,
    [
      check("username", "Username is required").optional(),
      check("email", "Please include a valid email").optional().isEmail(),
      check("phone_number", "Please enter a valid phone number").optional(),
    ],
  ],
  usersController.updateProfile
);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get("/:id", usersController.getUserById);

// @route   PUT api/users/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  [
    authMiddleware,
    [
      check("currentPassword", "Current password is required").notEmpty(),
      check(
        "newPassword",
        "Please enter a password with 6 or more characters"
      ).isLength({ min: 6 }),
    ],
  ],
  usersController.changePassword
);

// @route   POST api/users/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post(
  "/profile-picture",
  authMiddleware,
  usersController.uploadProfilePicture
);

module.exports = router;
