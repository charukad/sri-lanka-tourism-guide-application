const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const guidesController = require("../../controllers/guides");
const authMiddleware = require("../../middleware/auth");
const roleMiddleware = require("../../middleware/role");

// @route   GET api/guides
// @desc    Get all guides with filtering
// @access  Public
router.get("/", guidesController.getGuides);

// @route   GET api/guides/:id
// @desc    Get guide by ID
// @access  Public
router.get("/:id", guidesController.getGuideById);

// @route   POST api/guides
// @desc    Create or update guide profile
// @access  Private (guides only)
router.post(
  "/",
  [
    authMiddleware,
    roleMiddleware("guide"),
    [
      check("expertise", "Expertise field is required").notEmpty(),
      check("languages", "Languages field is required").notEmpty(),
      check("description", "Description field is required").notEmpty(),
      check("hourly_rate", "Hourly rate must be a number").isNumeric(),
    ],
  ],
  guidesController.createGuideProfile
);

// @route   PUT api/guides/availability
// @desc    Update guide availability
// @access  Private (guides only)
router.put(
  "/availability",
  [authMiddleware, roleMiddleware("guide")],
  guidesController.updateAvailability
);

// @route   GET api/guides/:id/reviews
// @desc    Get reviews for a guide
// @access  Public
router.get("/:id/reviews", guidesController.getGuideReviews);

// @route   POST api/guides/:id/reviews
// @desc    Create a review for a guide
// @access  Private (tourists only)
router.post(
  "/:id/reviews",
  [
    authMiddleware,
    roleMiddleware("tourist"),
    [
      check("rating", "Rating is required").isNumeric(),
      check("comment", "Comment is required").notEmpty(),
    ],
  ],
  guidesController.createGuideReview
);

// @route   GET api/guides/bookings/me
// @desc    Get all bookings for the logged in guide
// @access  Private (guides only)
router.get(
  "/bookings/me",
  [authMiddleware, roleMiddleware("guide")],
  guidesController.getGuideBookings
);

// @route   PUT api/guides/bookings/:id
// @desc    Update booking status
// @access  Private (guides only)
router.put(
  "/bookings/:id",
  [
    authMiddleware,
    roleMiddleware("guide"),
    check("status", "Status is required").isIn([
      "confirmed",
      "completed",
      "cancelled",
    ]),
  ],
  guidesController.updateBookingStatus
);

module.exports = router;
