import api from "../api/axios";

const GuideService = {
  /**
   * Get all guides with optional filtering
   * @param {Object} filters - Filtering parameters
   * @returns {Promise} - API response
   */
  getAllGuides: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return api.get(`/api/guides?${queryString}`);
  },

  /**
   * Get guide by ID
   * @param {string} id - Guide ID
   * @returns {Promise} - API response
   */
  getGuideById: async (id) => {
    return api.get(`/api/guides/${id}`);
  },

  /**
   * Book a guide
   * @param {string} guideId - Guide ID
   * @param {Object} bookingData - Booking details
   * @returns {Promise} - API response
   */
  bookGuide: async (guideId, bookingData) => {
    return api.post(`/api/bookings/guide/${guideId}`, bookingData);
  },

  /**
   * Get reviews for a guide
   * @param {string} guideId - Guide ID
   * @returns {Promise} - API response
   */
  getGuideReviews: async (guideId) => {
    return api.get(`/api/guides/${guideId}/reviews`);
  },

  /**
   * Create a review for a guide
   * @param {string} guideId - Guide ID
   * @param {Object} reviewData - Review details
   * @returns {Promise} - API response
   */
  createGuideReview: async (guideId, reviewData) => {
    return api.post(`/api/guides/${guideId}/reviews`, reviewData);
  },

  /**
   * Create or update guide profile (for guides)
   * @param {Object} profileData - Guide profile data
   * @returns {Promise} - API response
   */
  createGuideProfile: async (profileData) => {
    return api.post("/api/guides", profileData);
  },

  /**
   * Update guide availability (for guides)
   * @param {Array} availability - Array of availability objects
   * @returns {Promise} - API response
   */
  updateAvailability: async (availability) => {
    return api.put("/api/guides/availability", { availability });
  },

  /**
   * Get guide bookings (for guides)
   * @returns {Promise} - API response
   */
  getGuideBookings: async () => {
    return api.get("/api/guides/bookings/me");
  },

  /**
   * Update booking status (for guides)
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @returns {Promise} - API response
   */
  updateBookingStatus: async (bookingId, status) => {
    return api.put(`/api/guides/bookings/${bookingId}`, { status });
  },
};

export default GuideService;
