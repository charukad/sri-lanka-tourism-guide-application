import api from "../api/axios";

// Service for handling event-related API calls
const eventService = {
  // Get all events with filtering
  getEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return await api.get(`/events${query}`);
  },

  // Get event by ID
  getEventById: async (eventId) => {
    return await api.get(`/events/${eventId}`);
  },

  // Get events for a specific month
  getEventsByMonth: async (year, month) => {
    return await api.get(`/events/month/${year}/${month}`);
  },

  // Get featured events
  getFeaturedEvents: async () => {
    return await api.get("/events/featured");
  },
};

export default eventService;
