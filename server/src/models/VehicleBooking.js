// Vehicle Booking model
const mongoose = require("mongoose");

const VehicleBookingSchema = new mongoose.Schema(
  {
    tourist: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.ObjectId,
      ref: "Vehicle",
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
    pickupLocation: {
      type: String,
      required: [true, "Please add a pickup location"],
    },
    returnLocation: {
      type: String,
      required: [true, "Please add a return location"],
    },
    driverOption: {
      type: String,
      enum: ["with-driver", "self-drive"],
      required: true,
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

module.exports = mongoose.model("VehicleBooking", VehicleBookingSchema);
