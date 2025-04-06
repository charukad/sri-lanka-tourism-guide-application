// Itinerary controller (server/src/controllers/itineraries.js)
const Itinerary = require("../models/Itinerary");
const Location = require("../models/Location");

// @desc    Create new itinerary
// @route   POST /api/itineraries
// @access  Private
exports.createItinerary = async (req, res) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Validate dates
    if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Generate days based on start and end date
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    const days = [];

    const dayCount =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < dayCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      days.push({
        dayNumber: i + 1,
        date,
        destinations: [],
      });
    }

    req.body.days = days;

    // Create itinerary
    const itinerary = await Itinerary.create(req.body);

    res.status(201).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Add destination to itinerary day
// @route   POST /api/itineraries/:id/day/:dayNumber/destinations
// @access  Private
exports.addDestinationToDay = async (req, res) => {
  try {
    const { id, dayNumber } = req.params;
    const { locationId } = req.body;

    // Check if itinerary exists
    const itinerary = await Itinerary.findById(id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    // Check ownership
    if (itinerary.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check if location exists
    const location = await Location.findById(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    // Find the day
    const dayIndex = itinerary.days.findIndex(
      (day) => day.dayNumber == dayNumber
    );

    if (dayIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Day not found",
      });
    }

    // Check if location already exists for this day
    const destinationExists = itinerary.days[dayIndex].destinations.some(
      (dest) => dest.location.toString() === locationId
    );

    if (destinationExists) {
      return res.status(400).json({
        success: false,
        message: "Destination already exists in this day",
      });
    }

    // Add destination to day
    itinerary.days[dayIndex].destinations.push({
      location: locationId,
      notes: req.body.notes || "",
      startTime: req.body.startTime || "",
      endTime: req.body.endTime || "",
    });

    await itinerary.save();

    res.status(200).json({
      success: true,
      data: itinerary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
