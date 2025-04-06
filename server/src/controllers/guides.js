const Guide = require("../models/Guide");
const User = require("../models/User");
const GuideBooking = require("../models/GuideBooking");
const Review = require("../models/Review");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// @desc    Get all guides with filtering
// @route   GET /api/guides
// @access  Public
exports.getGuides = async (req, res, next) => {
  try {
    const {
      expertise,
      languages,
      rating,
      availability_start,
      availability_end,
      limit = 10,
      page = 1,
    } = req.query;

    let query = {};

    // Add filters if provided
    if (expertise) {
      query.expertise = { $regex: expertise, $options: "i" };
    }

    if (languages) {
      const languageArray = languages.split(",");
      query.languages = { $in: languageArray };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Filter by availability if dates provided
    if (availability_start && availability_end) {
      query.availability = {
        $elemMatch: {
          start_date: { $lte: new Date(availability_end) },
          end_date: { $gte: new Date(availability_start) },
        },
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find guides with pagination
    const guides = await Guide.find(query)
      .populate("user", "username email profile_pic")
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ rating: -1 });

    // Get total count for pagination
    const total = await Guide.countDocuments(query);

    res.json({
      success: true,
      count: guides.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      current_page: parseInt(page),
      data: guides,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Get guide by ID
// @route   GET /api/guides/:id
// @access  Public
exports.getGuideById = async (req, res, next) => {
  try {
    const guide = await Guide.findById(req.params.id).populate(
      "user",
      "username email profile_pic phone_number"
    );

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    res.json({
      success: true,
      data: guide,
    });
  } catch (err) {
    console.error(err.message);
    // Check if error is due to invalid ObjectId
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Guide not found" });
    }
    next(err);
  }
};

// @desc    Create or update guide profile
// @route   POST /api/guides
// @access  Private (guides only)
exports.createGuideProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    expertise,
    languages,
    description,
    hourly_rate,
    certification,
    experience_years,
    services_offered,
  } = req.body;

  try {
    // Build guide profile object
    const guideFields = {
      user: req.user.id,
      expertise,
      languages,
      description,
      hourly_rate,
      certification,
      experience_years,
      services_offered,
    };

    let guide = await Guide.findOne({ user: req.user.id });

    if (guide) {
      // Update
      guide = await Guide.findOneAndUpdate(
        { user: req.user.id },
        { $set: guideFields },
        { new: true }
      );
    } else {
      // Create
      guide = new Guide(guideFields);
      await guide.save();
    }

    res.json({
      success: true,
      data: guide,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Update guide availability
// @route   PUT /api/guides/availability
// @access  Private (guides only)
exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res
        .status(400)
        .json({ message: "Availability must be an array of date ranges" });
    }

    // Validate each availability entry
    for (const entry of availability) {
      if (!entry.start_date || !entry.end_date) {
        return res
          .status(400)
          .json({
            message:
              "Each availability entry must have start_date and end_date",
          });
      }

      const startDate = new Date(entry.start_date);
      const endDate = new Date(entry.end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Invalid date format in availability" });
      }

      if (startDate > endDate) {
        return res
          .status(400)
          .json({ message: "Start date cannot be after end date" });
      }
    }

    const guide = await Guide.findOneAndUpdate(
      { user: req.user.id },
      { $set: { availability } },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({ message: "Guide profile not found" });
    }

    res.json({
      success: true,
      data: guide,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Get reviews for a guide
// @route   GET /api/guides/:id/reviews
// @access  Public
exports.getGuideReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      entity_id: req.params.id,
      entity_type: "guide",
    })
      .populate("user", "username profile_pic")
      .sort({ created_at: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Create a review for a guide
// @route   POST /api/guides/:id/reviews
// @access  Private (tourists only)
exports.createGuideReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rating, comment } = req.body;

  try {
    // Check if guide exists
    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    // Check if user has already reviewed this guide
    const existingReview = await Review.findOne({
      user: req.user.id,
      entity_id: req.params.id,
      entity_type: "guide",
    });

    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this guide" });
    }

    // Create review
    const review = new Review({
      user: req.user.id,
      entity_id: req.params.id,
      entity_type: "guide",
      rating,
      comment,
    });

    await review.save();

    // Update guide rating
    const reviews = await Review.find({
      entity_id: req.params.id,
      entity_type: "guide",
    });

    guide.rating =
      reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
    await guide.save();

    res.json({
      success: true,
      data: review,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Get all bookings for the logged in guide
// @route   GET /api/guides/bookings/me
// @access  Private (guides only)
exports.getGuideBookings = async (req, res, next) => {
  try {
    // Find guide ID from user ID
    const guide = await Guide.findOne({ user: req.user.id });

    if (!guide) {
      return res.status(404).json({ message: "Guide profile not found" });
    }

    const bookings = await GuideBooking.find({ guide: guide._id })
      .populate("tourist", "username email profile_pic")
      .sort({ created_at: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// @desc    Update booking status
// @route   PUT /api/guides/bookings/:id
// @access  Private (guides only)
exports.updateBookingStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body;

  try {
    // Find guide ID from user ID
    const guide = await Guide.findOne({ user: req.user.id });

    if (!guide) {
      return res.status(404).json({ message: "Guide profile not found" });
    }

    // Find booking and check if it belongs to this guide
    let booking = await GuideBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.guide.toString() !== guide._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this booking" });
    }

    booking = await GuideBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("tourist", "username email profile_pic");

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};
