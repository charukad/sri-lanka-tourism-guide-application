import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

// Storage keys
const STORAGE_KEYS = {
  LOCATIONS: "offline_locations",
  ITINERARIES: "offline_itineraries",
  GUIDES: "offline_guides",
  VEHICLES: "offline_vehicles",
  EVENTS: "offline_events",
  PENDING_ACTIONS: "offline_pending_actions",
};

/**
 * Save data for offline use
 * @param {string} key - Storage key
 * @param {Array|Object} data - Data to store
 * @returns {Promise} - Resolves when data is stored
 */
const saveOfflineData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    console.log(`Saved offline data for ${key}`);
  } catch (error) {
    console.error(`Error saving offline data for ${key}:`, error);
    throw error;
  }
};

/**
 * Get data stored for offline use
 * @param {string} key - Storage key
 * @returns {Promise<Array|Object>} - Stored data
 */
const getOfflineData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting offline data for ${key}:`, error);
    throw error;
  }
};

/**
 * Check if network is available
 * @returns {Promise<boolean>} - True if network is connected
 */
const isNetworkAvailable = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

/**
 * Add a pending action to be performed when online
 * @param {Object} action - Action to be performed
 * @returns {Promise} - Resolves when action is stored
 */
const addPendingAction = async (action) => {
  try {
    const pendingActions =
      (await getOfflineData(STORAGE_KEYS.PENDING_ACTIONS)) || [];
    pendingActions.push({
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });

    await saveOfflineData(STORAGE_KEYS.PENDING_ACTIONS, pendingActions);
  } catch (error) {
    console.error("Error adding pending action:", error);
    throw error;
  }
};

/**
 * Get all pending actions
 * @returns {Promise<Array>} - Array of pending actions
 */
const getPendingActions = async () => {
  return (await getOfflineData(STORAGE_KEYS.PENDING_ACTIONS)) || [];
};

/**
 * Remove a pending action
 * @param {string} actionId - ID of action to remove
 * @returns {Promise} - Resolves when action is removed
 */
const removePendingAction = async (actionId) => {
  try {
    const pendingActions =
      (await getOfflineData(STORAGE_KEYS.PENDING_ACTIONS)) || [];
    const updatedActions = pendingActions.filter(
      (action) => action.id !== actionId
    );

    await saveOfflineData(STORAGE_KEYS.PENDING_ACTIONS, updatedActions);
  } catch (error) {
    console.error("Error removing pending action:", error);
    throw error;
  }
};

/**
 * Sync a specific data type
 * @param {string} type - Data type to sync
 * @param {Function} fetchFunction - Function to fetch updated data
 * @returns {Promise} - Resolves when sync is complete
 */
const syncData = async (type, fetchFunction) => {
  if (!(await isNetworkAvailable())) {
    console.log(`Cannot sync ${type} data: Network unavailable`);
    return;
  }

  try {
    const response = await fetchFunction();

    if (response && response.data) {
      await saveOfflineData(STORAGE_KEYS[type.toUpperCase()], response.data);
      console.log(`Successfully synced ${type} data`);
    }
  } catch (error) {
    console.error(`Error syncing ${type} data:`, error);
    throw error;
  }
};

/**
 * Process all pending actions
 * @param {Object} apiServices - Object containing API service functions
 * @returns {Promise<Array>} - Results of processed actions
 */
const processPendingActions = async (apiServices) => {
  if (!(await isNetworkAvailable())) {
    console.log("Cannot process pending actions: Network unavailable");
    return [];
  }

  const pendingActions = await getPendingActions();

  if (pendingActions.length === 0) {
    console.log("No pending actions to process");
    return [];
  }

  const results = [];

  for (const action of pendingActions) {
    try {
      const { type, payload, endpoint, method } = action;

      // Find the appropriate service and method
      const [serviceName, methodName] = endpoint.split(".");

      if (!apiServices[serviceName] || !apiServices[serviceName][methodName]) {
        throw new Error(`Invalid endpoint: ${endpoint}`);
      }

      // Execute the API call
      const response = await apiServices[serviceName][methodName](payload);

      // If successful, remove the action
      await removePendingAction(action.id);

      results.push({
        id: action.id,
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error(`Error processing pending action ${action.id}:`, error);

      results.push({
        id: action.id,
        success: false,
        error: error.message,
      });

      // If error is not network-related, remove the action to prevent infinite retry
      if (
        error.message !== "Network Error" &&
        error.message !== "Network request failed"
      ) {
        await removePendingAction(action.id);
      }
    }
  }

  return results;
};

/**
 * Initialize offline sync service
 * @param {Object} options - Configuration options
 * @returns {Object} - Offline service methods
 */
const initOfflineSync = (options = {}) => {
  const { syncInterval = 5 * 60 * 1000, apiServices } = options;

  // Start periodic sync
  if (syncInterval > 0) {
    // Sync locations periodically
    setInterval(async () => {
      if (await isNetworkAvailable()) {
        try {
          await syncData(
            "locations",
            apiServices.locationService.getAllLocations
          );
          await syncData("events", apiServices.eventService.getAllEvents);
          await processPendingActions(apiServices);
        } catch (error) {
          console.error("Periodic sync error:", error);
        }
      }
    }, syncInterval);
  }

  // Listen for network status changes
  NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      console.log("Network is available, processing pending actions...");
      processPendingActions(apiServices).catch((error) => {
        console.error("Error processing pending actions:", error);
      });
    }
  });

  return {
    saveOfflineData,
    getOfflineData,
    isNetworkAvailable,
    addPendingAction,
    getPendingActions,
    syncData,
    processPendingActions,
    STORAGE_KEYS,
  };
};

export default {
  initOfflineSync,
  saveOfflineData,
  getOfflineData,
  isNetworkAvailable,
  addPendingAction,
  getPendingActions,
  syncData,
  processPendingActions,
  STORAGE_KEYS,
};
