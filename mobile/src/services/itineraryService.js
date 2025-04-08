import api from "../api/axios";
import offlineService from "./offlineService";
import { v4 as uuidv4 } from "uuid";

/**
 * Get all itineraries for current user
 * @returns {Promise} - API response or offline data
 */
const getAllItineraries = async () => {
  try {
    // Try to get data from API
    if (await offlineService.isNetworkAvailable()) {
      const response = await api.get("/api/itineraries");

      // Cache the data for offline use
      await offlineService.saveOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES,
        response.data
      );

      return response;
    } else {
      console.log("Network unavailable, using cached itineraries");
      const cachedData = await offlineService.getOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES
      );

      if (cachedData) {
        return { data: cachedData };
      } else {
        throw new Error("No cached itineraries available");
      }
    }
  } catch (error) {
    console.error("Error getting itineraries:", error);
    throw error;
  }
};

/**
 * Get itinerary by ID
 * @param {string} id - Itinerary ID
 * @returns {Promise} - API response or offline data
 */
const getItineraryById = async (id) => {
  try {
    // Try to get data from API
    if (await offlineService.isNetworkAvailable()) {
      const response = await api.get(`/api/itineraries/${id}`);
      return response;
    } else {
      console.log("Network unavailable, using cached itinerary");
      const cachedItineraries = await offlineService.getOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES
      );

      if (cachedItineraries && cachedItineraries.data) {
        const itinerary = cachedItineraries.data.find(
          (item) => item._id === id
        );

        if (itinerary) {
          return { data: { success: true, data: itinerary } };
        } else {
          throw new Error("Itinerary not found in cache");
        }
      } else {
        throw new Error("No cached itineraries available");
      }
    }
  } catch (error) {
    console.error(`Error getting itinerary ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new itinerary
 * @param {Object} itineraryData - Itinerary data
 * @returns {Promise} - API response
 */
const createItinerary = async (itineraryData) => {
  try {
    if (await offlineService.isNetworkAvailable()) {
      // We're online, create normally
      const response = await api.post("/api/itineraries", itineraryData);

      // Update cached itineraries
      const cachedItineraries = (await offlineService.getOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES
      )) || { data: [] };

      cachedItineraries.data.push(response.data.data);
      await offlineService.saveOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES,
        cachedItineraries
      );

      return response;
    } else {
      // We're offline, create locally with temp ID
      const tempId = `temp_${uuidv4()}`;
      const tempItinerary = {
        ...itineraryData,
        _id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_synced: false,
      };

      // Add to pending actions for later sync
      await offlineService.addPendingAction({
        type: "CREATE_ITINERARY",
        endpoint: "itineraryService.createItinerary",
        payload: itineraryData,
        tempId,
      });

      // Add to local cache
      const cachedItineraries = (await offlineService.getOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES
      )) || { data: [] };

      cachedItineraries.data.push(tempItinerary);
      await offlineService.saveOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES,
        cachedItineraries
      );

      // Return local response
      return {
        data: {
          success: true,
          data: tempItinerary,
          message: "Created offline (will sync when online)",
        },
      };
    }
  } catch (error) {
    console.error("Error creating itinerary:", error);
    throw error;
  }
};

/**
 * Update an itinerary
 * @param {string} id - Itinerary ID
 * @param {Object} itineraryData - Updated itinerary data
 * @returns {Promise} - API response
 */
const updateItinerary = async (id, itineraryData) => {
  try {
    if (await offlineService.isNetworkAvailable()) {
      // We're online, update normally
      const response = await api.put(`/api/itineraries/${id}`, itineraryData);

      // Update cached itineraries
      const cachedItineraries = await offlineService.getOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES
      );

      if (cachedItineraries && cachedItineraries.data) {
        const index = cachedItineraries.data.findIndex(
          (item) => item._id === id
        );

        if (index >= 0) {
          cachedItineraries.data[index] = {
            ...cachedItineraries.data[index],
            ...response.data.data,
          };

          await offlineService.saveOfflineData(
            offlineService.STORAGE_KEYS.ITINERARIES,
            cachedItineraries
          );
        }
      }

      return response;
    } else {
      // We're offline, update locally
      const cachedItineraries = await offlineService.getOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES
      );

      if (!cachedItineraries || !cachedItineraries.data) {
        throw new Error("No cached itineraries available");
      }

      const index = cachedItineraries.data.findIndex((item) => item._id === id);

      if (index < 0) {
        throw new Error("Itinerary not found in cache");
      }

      // Update local cache
      cachedItineraries.data[index] = {
        ...cachedItineraries.data[index],
        ...itineraryData,
        updated_at: new Date().toISOString(),
        is_synced: false,
      };

      await offlineService.saveOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES,
        cachedItineraries
      );

      // Add to pending actions for later sync
      await offlineService.addPendingAction({
        type: "UPDATE_ITINERARY",
        endpoint: "itineraryService.updateItinerary",
        payload: { id, itineraryData },
      });

      // Return local response
      return {
        data: {
          success: true,
          data: cachedItineraries.data[index],
          message: "Updated offline (will sync when online)",
        },
      };
    }
  } catch (error) {
    console.error(`Error updating itinerary ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an itinerary
 * @param {string} id - Itinerary ID
 * @returns {Promise} - API response
 */
const deleteItinerary = async (id) => {
  try {
    if (await offlineService.isNetworkAvailable()) {
      // We're online, delete normally
      const response = await api.delete(`/api/itineraries/${id}`);

      // Update cached itineraries
      const cachedItineraries = await offlineService.getOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES
      );

      if (cachedItineraries && cachedItineraries.data) {
        cachedItineraries.data = cachedItineraries.data.filter(
          (item) => item._id !== id
        );

        await offlineService.saveOfflineData(
          offlineService.STORAGE_KEYS.ITINERARIES,
          cachedItineraries
        );
      }

      return response;
    } else {
      // We're offline, mark for deletion
      const cachedItineraries = await offlineService.getOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES
      );

      if (!cachedItineraries || !cachedItineraries.data) {
        throw new Error("No cached itineraries available");
      }

      // If it's a temp ID (not yet synced), just remove it from cache
      if (id.startsWith("temp_")) {
        cachedItineraries.data = cachedItineraries.data.filter(
          (item) => item._id !== id
        );
      } else {
        // Mark the itinerary as deleted but keep in cache until synced
        const index = cachedItineraries.data.findIndex(
          (item) => item._id === id
        );

        if (index >= 0) {
          cachedItineraries.data[index].is_deleted = true;
          cachedItineraries.data[index].is_synced = false;
        }

        // Add to pending actions for later sync
        await offlineService.addPendingAction({
          type: "DELETE_ITINERARY",
          endpoint: "itineraryService.deleteItinerary",
          payload: id,
        });
      }

      await offlineService.saveOfflineData(
        offlineService.STORAGE_KEYS.ITINERARIES,
        cachedItineraries
      );

      // Return local response
      return {
        data: {
          success: true,
          message: "Deleted offline (will sync when online)",
        },
      };
    }
  } catch (error) {
    console.error(`Error deleting itinerary ${id}:`, error);
    throw error;
  }
};

export default {
  getAllItineraries,
  getItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary,
};
