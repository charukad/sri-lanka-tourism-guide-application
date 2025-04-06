// Notification model (server/src/models/Notification.js)
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["event", "itinerary", "booking", "alert", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.ObjectId,
      refPath: "onModel",
    },
    onModel: {
      type: String,
      enum: ["Event", "Itinerary", "GuideBooking", "VehicleBooking", "Alert"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);
