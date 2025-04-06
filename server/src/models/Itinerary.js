// Itinerary model (server/src/models/Itinerary.js)
const mongoose = require("mongoose");

const ItinerarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
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
    days: [
      {
        dayNumber: Number,
        date: Date,
        destinations: [
          {
            location: {
              type: mongoose.Schema.ObjectId,
              ref: "Location",
            },
            notes: String,
            startTime: String,
            endTime: String,
            timeAdded: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    budget: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Itinerary", ItinerarySchema);
