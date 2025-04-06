const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const vehiclesController = require("../../controllers/vehicles");
const authMiddleware = require("../../middleware/auth");
const roleMiddleware = require("../../middleware/role");

// @route   GET api/vehicles
// @desc    Get all vehicles with filtering
// @access  Public
router.get("/", vehiclesController.getVehicles);

// @route   GET api/vehicles/:id
// @desc    Get vehicle by ID
// @access  Public
router.get("/:id", vehiclesController.getVehicleById);

// @route   POST api/vehicles
// @desc    Create a new vehicle
// @access  Private (vehicle owners only)
router.post(
  "/",
  [
    authMiddleware,
    roleMiddleware("vehicle_owner"),
    [
      check("type", "Type is required").notEmpty(),
      check("model", "Model is required").notEmpty(),
      check("capacity", "Capacity must be a number").isNumeric(),
      check("rate_per_day", "Daily rate must be a number").isNumeric(),
      check("description", "Description is required").notEmpty(),
    ],
  ],
  vehiclesController.createVehicle
);

// @route   PUT api/vehicles/:id
// @desc    Update a vehicle
// @access  Private (vehicle owners only)
router.put(
  "/:id",
  [authMiddleware, roleMiddleware("vehicle_owner")],
  vehiclesController.updateVehicle
);

// @route   DELETE api/vehicles/:id
// @desc    Delete a vehicle
// @access  Private (vehicle owners only)
router.delete(
  "/:id",
  [authMiddleware, roleMiddleware("vehicle_owner")],
  vehiclesController.deleteVehicle
);

// @route   POST api/vehicles/:id/photos
// @desc    Upload vehicle photos
// @access  Private (vehicle owners only)
router.post(
  "/:id/photos",
  [authMiddleware, roleMiddleware("vehicle_owner")],
  vehiclesController.uploadVehiclePhotos
);

// @route   GET api/vehicles/bookings/me
// @desc    Get all bookings for logged in vehicle owner
// @access  Private (vehicle owners only)
router.get(
  "/bookings/me",
  [authMiddleware, roleMiddleware("vehicle_owner")],
  vehiclesController.getOwnerBookings
);

// @route   PUT api/vehicles/bookings/:id
// @desc    Update booking status
// @access  Private (vehicle owners only)
router.put(
  "/bookings/:id",
  [
    authMiddleware,
    roleMiddleware("vehicle_owner"),
    check("status", "Status is required").isIn([
      "confirmed",
      "completed",
      "cancelled",
    ]),
  ],
  vehiclesController.updateBookingStatus
);

// @route   GET api/vehicles/:id/reviews
// @desc    Get reviews for a vehicle
// @access  Public
router.get("/:id/reviews", vehiclesController.getVehicleReviews);

// @route   POST api/vehicles/:id/reviews
// @desc    Create a review for a vehicle
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
  vehiclesController.createVehicleReview
);

module.exports = router;
