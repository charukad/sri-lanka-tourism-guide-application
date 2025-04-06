// Location model (server/src/models/Location.js)
const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    category: {
      type: String,
      enum: ["historical", "nature", "beach", "religious", "scenic"],
      required: true,
    },
    latitude: {
      type: Number,
      required: [true, "Please add latitude"],
    },
    longitude: {
      type: Number,
      required: [true, "Please add longitude"],
    },
    images: [String],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    activities: [String],
    openingHours: String,
    entranceFee: String,
    bestTimeToVisit: String,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtual for reviews
LocationSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "location",
  justOne: false,
});

module.exports = mongoose.model("Location", LocationSchema);
