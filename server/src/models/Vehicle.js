// Vehicle model (server/src/models/Vehicle.js)
const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["car", "suv", "van", "motorcycle", "tuk-tuk"],
      required: true,
    },
    images: {
      type: [String],
      required: [true, "Please add at least one image"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    features: [String],
    specifications: {
      passengers: {
        type: Number,
        required: true,
      },
      luggage: {
        type: Number,
        required: true,
      },
      doors: {
        type: Number,
        default: 0,
      },
      transmission: {
        type: String,
        enum: ["Manual", "Automatic"],
        required: true,
      },
      airConditioned: {
        type: Boolean,
        default: false,
      },
      fuelType: {
        type: String,
        required: true,
      },
    },
    pricePerDay: {
      type: Number,
      required: [true, "Please add price per day"],
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
    },
    availableForDelivery: {
      type: Boolean,
      default: false,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for average rating
VehicleSchema.virtual("rating", {
  ref: "Review",
  localField: "_id",
  foreignField: "vehicle",
  justOne: false,
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
