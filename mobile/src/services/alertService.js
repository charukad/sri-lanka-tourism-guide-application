import api from "../api/axios";

const AlertService = {
  /**
   * Get weather alerts for a location
   * @param {string} locationId - Location ID
   * @returns {Promise} - API response
   */
  getWeatherAlerts: async (locationId) => {
    return api.get(`/api/alerts/weather/${locationId}`);
  },

  /**
   * Get all active alerts for current user
   * @returns {Promise} - API response
   */
  getUserAlerts: async () => {
    return api.get("/api/alerts/me");
  },

  /**
   * Subscribe to alerts for a location
   * @param {string} locationId - Location ID
   * @returns {Promise} - API response
   */
  subscribeToLocationAlerts: async (locationId) => {
    return api.post(`/api/alerts/subscribe/${locationId}`);
  },

  /**
   * Unsubscribe from alerts for a location
   * @param {string} locationId - Location ID
   * @returns {Promise} - API response
   */
  unsubscribeFromLocationAlerts: async (locationId) => {
    return api.delete(`/api/alerts/unsubscribe/${locationId}`);
  },

  /**
   * Mark alert as read
   * @param {string} alertId - Alert ID
   * @returns {Promise} - API response
   */
  markAlertAsRead: async (alertId) => {
    return api.put(`/api/alerts/${alertId}/read`);
  },

  /**
   * Mark all alerts as read
   * @returns {Promise} - API response
   */
  markAllAlertsAsRead: async () => {
    return api.put("/api/alerts/read-all");
  },
};

export default AlertService;
