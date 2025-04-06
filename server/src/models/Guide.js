// Guide model (server/src/models/Guide.js)
const mongoose = require("mongoose");

const GuideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    bio: {
      type: String,
      required: [true, "Please add a bio"],
    },
    experience: {
      type: Number,
      required: [true, "Please add years of experience"],
    },
    languages: {
      type: [String],
      required: [true, "Please add at least one language"],
    },
    expertise: {
      type: [String],
      required: [true, "Please add area(s) of expertise"],
    },
    areas: {
      type: [String],
      required: [true, "Please add operating area(s)"],
    },
    pricePerDay: {
      type: Number,
      required: [true, "Please add price per day"],
    },
    gallery: [String],
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true },
    },
    contactInfo: {
      email: String,
      phone: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for average rating
GuideSchema.virtual("rating", {
  ref: "Review",
  localField: "_id",
  foreignField: "guide",
  justOne: false,
  options: { sort: { createdAt: -1 } },
});

module.exports = mongoose.model("Guide", GuideSchema);
