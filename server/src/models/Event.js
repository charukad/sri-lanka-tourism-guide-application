const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an event name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    location: {
      type: mongoose.Schema.ObjectId,
      ref: "Location",
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
    images: [String],
    category: {
      type: String,
      enum: [
        "festival",
        "religious",
        "cultural",
        "music",
        "food",
        "sports",
        "other",
      ],
      required: true,
    },
    organizer: {
      name: String,
      contact: String,
      website: String,
    },
    admission: {
      type: String,
      enum: ["free", "paid", "donation"],
      default: "free",
    },
    price: {
      type: String,
      default: "Free",
    },
    featured: {
      type: Boolean,
      default: false,
    },
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

// Create index for date-based queries
EventSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Event", EventSchema);
