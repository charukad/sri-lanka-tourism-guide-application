import api from "../api/axios";

const VehicleService = {
  /**
   * Get all vehicles with optional filtering
   * @param {Object} filters - Filtering parameters
   * @returns {Promise} - API response
   */
  getAllVehicles: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return api.get(`/api/vehicles?${queryString}`);
  },

  /**
   * Get vehicle by ID
   * @param {string} id - Vehicle ID
   * @returns {Promise} - API response
   */
  getVehicleById: async (id) => {
    return api.get(`/api/vehicles/${id}`);
  },

  /**
   * Book a vehicle
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} bookingData - Booking details
   * @returns {Promise} - API response
   */
  bookVehicle: async (vehicleId, bookingData) => {
    return api.post(`/api/bookings/vehicle/${vehicleId}`, bookingData);
  },

  /**
   * Get reviews for a vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response
   */
  getVehicleReviews: async (vehicleId) => {
    return api.get(`/api/vehicles/${vehicleId}/reviews`);
  },

  /**
   * Create a review for a vehicle
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} reviewData - Review details
   * @returns {Promise} - API response
   */
  createVehicleReview: async (vehicleId, reviewData) => {
    return api.post(`/api/vehicles/${vehicleId}/reviews`, reviewData);
  },

  /**
   * Create a new vehicle (for vehicle owners)
   * @param {Object} vehicleData - Vehicle details
   * @returns {Promise} - API response
   */
  createVehicle: async (vehicleData) => {
    return api.post("/api/vehicles", vehicleData);
  },

  /**
   * Update vehicle details (for vehicle owners)
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} vehicleData - Updated vehicle details
   * @returns {Promise} - API response
   */
  updateVehicle: async (vehicleId, vehicleData) => {
    return api.put(`/api/vehicles/${vehicleId}`, vehicleData);
  },

  /**
   * Delete vehicle (for vehicle owners)
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response
   */
  deleteVehicle: async (vehicleId) => {
    return api.delete(`/api/vehicles/${vehicleId}`);
  },

  /**
   * Upload vehicle photos (for vehicle owners)
   * @param {string} vehicleId - Vehicle ID
   * @param {FormData} formData - Form data with photos
   * @returns {Promise} - API response
   */
  uploadVehiclePhotos: async (vehicleId, formData) => {
    return api.post(`/api/vehicles/${vehicleId}/photos`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Get vehicle owner's bookings (for vehicle owners)
   * @returns {Promise} - API response
   */
  getOwnerBookings: async () => {
    return api.get("/api/vehicles/bookings/me");
  },

  /**
   * Update booking status (for vehicle owners)
   * @param {string} bookingId - Booking ID
   * @param {string} status - New status
   * @returns {Promise} - API response
   */
  updateBookingStatus: async (bookingId, status) => {
    return api.put(`/api/vehicles/bookings/${bookingId}`, { status });
  },
};

export default VehicleService;
