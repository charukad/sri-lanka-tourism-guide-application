const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const alertsController = require("../../controllers/alerts");
const authMiddleware = require("../../middleware/auth");
const roleMiddleware = require("../../middleware/role");
const validate = require("../../middleware/validation");

// @route   GET api/alerts/weather/:locationId
// @desc    Get weather alerts for a location
// @access  Public
router.get("/weather/:locationId", alertsController.getWeatherAlerts);

// @route   GET api/alerts/me
// @desc    Get all active alerts for a user
// @access  Private
router.get("/me", authMiddleware, alertsController.getUserAlerts);

// @route   POST api/alerts/subscribe/:locationId
// @desc    Subscribe to alerts for a location
// @access  Private
router.post(
  "/subscribe/:locationId",
  authMiddleware,
  alertsController.subscribeToLocationAlerts
);

// @route   DELETE api/alerts/unsubscribe/:locationId
// @desc    Unsubscribe from alerts for a location
// @access  Private
router.delete(
  "/unsubscribe/:locationId",
  authMiddleware,
  alertsController.unsubscribeFromLocationAlerts
);

// @route   PUT api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.put("/:id/read", authMiddleware, alertsController.markAlertAsRead);

// @route   POST api/alerts/system
// @desc    Create a system-wide alert (Admin only)
// @access  Private (Admin)
router.post(
  "/system",
  [
    authMiddleware,
    roleMiddleware("admin"),
    [
      check("title", "Title is required").notEmpty(),
      check("message", "Message is required").notEmpty(),
      check("severity", "Severity is required").isIn(["high", "medium", "low"]),
    ],
    validate,
  ],
  alertsController.createSystemAlert
);

module.exports = router;
