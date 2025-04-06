import api from "../api/axios";

const LocationService = {
  /**
   * Get all locations with optional filtering
   * @param {Object} filters - Filtering parameters
   * @returns {Promise} - API response
   */
  getAllLocations: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return api.get(`/api/locations?${queryString}`);
  },

  /**
   * Get location by ID
   * @param {string} id - Location ID
   * @returns {Promise} - API response
   */
  getLocationById: async (id) => {
    return api.get(`/api/locations/${id}`);
  },

  /**
   * Search locations by name or description
   * @param {string} query - Search query
   * @returns {Promise} - API response
   */
  searchLocations: async (query) => {
    return api.get(`/api/locations/search?query=${query}`);
  },

  /**
   * Get nearby locations
   * @param {number} latitude - Current latitude
   * @param {number} longitude - Current longitude
   * @param {number} radius - Search radius in kilometers
   * @returns {Promise} - API response
   */
  getNearbyLocations: async (latitude, longitude, radius = 10) => {
    return api.get(
      `/api/locations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
    );
  },

  /**
   * Get locations by category
   * @param {string} category - Location category
   * @returns {Promise} - API response
   */
  getLocationsByCategory: async (category) => {
    return api.get(`/api/locations/category/${category}`);
  },

  /**
   * Get reviews for a location
   * @param {string} locationId - Location ID
   * @returns {Promise} - API response
   */
  getLocationReviews: async (locationId) => {
    return api.get(`/api/locations/${locationId}/reviews`);
  },

  /**
   * Create a review for a location
   * @param {string} locationId - Location ID
   * @param {Object} reviewData - Review details
   * @returns {Promise} - API response
   */
  createLocationReview: async (locationId, reviewData) => {
    return api.post(`/api/locations/${locationId}/reviews`, reviewData);
  },

  /**
   * Get events near a location
   * @param {string} locationId - Location ID
   * @returns {Promise} - API response
   */
  getLocationEvents: async (locationId) => {
    return api.get(`/api/locations/${locationId}/events`);
  },
};

export default LocationService;
