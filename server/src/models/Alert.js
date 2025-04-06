const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "weather",
      "system",
      "booking",
      "payment",
      "location-subscription",
      "user-notification",
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "reference_model",
  },
  reference_model: {
    type: String,
    enum: ["Alert", "GuideBooking", "VehicleBooking", "Location", "Event"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  read_at: {
    type: Date,
  },
  expires_at: {
    type: Date,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient querying of active alerts
AlertSchema.index({ user: 1, active: 1 });

// Index for time-based expiration
AlertSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Alert", AlertSchema);
