// Guide Booking model (server/src/models/GuideBooking.js)
const mongoose = require("mongoose");

const GuideBookingSchema = new mongoose.Schema(
  {
    tourist: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    guide: {
      type: mongoose.Schema.ObjectId,
      ref: "Guide",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Please add a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please add an end date"],
    },
    requestDetails: {
      type: String,
      required: [true, "Please provide details about your trip"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GuideBooking", GuideBookingSchema);
