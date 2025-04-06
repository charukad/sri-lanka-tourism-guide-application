// mobile/src/services/guideService.js
import api from "../api/axios";

const GuideService = {
  getAllGuides: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return api.get(`/api/guides?${queryString}`);
  },

  getGuideById: async (id) => {
    return api.get(`/api/guides/${id}`);
  },

  bookGuide: async (guideId, bookingData) => {
    return api.post(`/api/guides/${guideId}/bookings`, bookingData);
  },

  // Additional methods
};

export default GuideService;
