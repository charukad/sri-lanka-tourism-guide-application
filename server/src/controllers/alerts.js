const Alert = require("../models/Alert");
const User = require("../models/User");
const Location = require("../models/Location");
const weatherService = require("../services/weatherService");
const mongoose = require("mongoose");

/**
 * @desc    Get weather alerts for a location
 * @route   GET /api/alerts/weather/:locationId
 * @access  Public
 */
exports.getWeatherAlerts = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.locationId);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Get weather alerts from weather service
    const alerts = await weatherService.getWeatherAlerts(
      location.latitude,
      location.longitude
    );

    res.json({
      success: true,
      data: alerts,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

/**
 * @desc    Get all active alerts for a user
 * @route   GET /api/alerts/me
 * @access  Private
 */
exports.getUserAlerts = async (req, res, next) => {
  try {
    // Find all alerts for the user
    const alerts = await Alert.find({
      user: req.user.id,
      active: true,
    }).sort({ created_at: -1 });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

/**
 * @desc    Subscribe to alerts for a location
 * @route   POST /api/alerts/subscribe/:locationId
 * @access  Private
 */
exports.subscribeToLocationAlerts = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.locationId);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Check if user is already subscribed
    const existingSubscription = await Alert.findOne({
      user: req.user.id,
      location: req.params.locationId,
      type: "location-subscription",
    });

    if (existingSubscription) {
      return res
        .status(400)
        .json({ message: "Already subscribed to alerts for this location" });
    }

    // Create alert subscription
    const subscription = new Alert({
      user: req.user.id,
      location: req.params.locationId,
      type: "location-subscription",
      message: `Subscribed to alerts for ${location.name}`,
      active: true,
    });

    await subscription.save();

    res.json({
      success: true,
      message: `Successfully subscribed to alerts for ${location.name}`,
      data: subscription,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

/**
 * @desc    Unsubscribe from alerts for a location
 * @route   DELETE /api/alerts/unsubscribe/:locationId
 * @access  Private
 */
exports.unsubscribeFromLocationAlerts = async (req, res, next) => {
  try {
    // Find and update subscription
    const subscription = await Alert.findOneAndUpdate(
      {
        user: req.user.id,
        location: req.params.locationId,
        type: "location-subscription",
      },
      {
        active: false,
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json({
      success: true,
      message: "Successfully unsubscribed from alerts",
      data: subscription,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

/**
 * @desc    Mark alert as read
 * @route   PUT /api/alerts/:id/read
 * @access  Private
 */
exports.markAlertAsRead = async (req, res, next) => {
  try {
    // Find alert and ensure it belongs to the user
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.read = true;
    alert.read_at = new Date();
    await alert.save();

    res.json({
      success: true,
      data: alert,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

/**
 * @desc    Create a system-wide alert (Admin only)
 * @route   POST /api/alerts/system
 * @access  Private (Admin)
 */
exports.createSystemAlert = async (req, res, next) => {
  try {
    const { title, message, severity, expires_at } = req.body;

    if (!title || !message || !severity) {
      return res
        .status(400)
        .json({ message: "Title, message and severity are required" });
    }

    // Create system alert
    const systemAlert = new Alert({
      title,
      message,
      severity,
      type: "system",
      active: true,
      expires_at: expires_at || null,
      created_by: req.user.id,
    });

    await systemAlert.save();

    // Create individual alerts for all users
    const users = await User.find().select("_id");

    // Prepare bulk operations
    const alertOperations = users.map((user) => ({
      insertOne: {
        document: {
          user: user._id,
          title,
          message,
          severity,
          type: "user-notification",
          reference: systemAlert._id,
          active: true,
          expires_at: expires_at || null,
        },
      },
    }));

    // Execute bulk operations
    await Alert.bulkWrite(alertOperations);

    res.json({
      success: true,
      message: "System alert created and delivered to all users",
      data: systemAlert,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};
