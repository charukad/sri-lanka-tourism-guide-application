import offlineService from "../../services/offlineService";

/**
 * Middleware to handle offline actions
 * Uses a special meta property: offline
 *
 * Example usage:
 * dispatch({
 *   type: 'SOME_ACTION',
 *   payload: data,
 *   meta: {
 *     offline: {
 *       effect: { endpoint: 'itineraryService.createItinerary', payload: data },
 *       commit: { type: 'SOME_ACTION_SUCCESS', meta: { id: tempId } },
 *       rollback: { type: 'SOME_ACTION_FAILURE', meta: { id: tempId } }
 *     }
 *   }
 * });
 */
const offlineMiddleware = (store) => (next) => async (action) => {
  // Skip actions without offline meta
  if (!action.meta || !action.meta.offline) {
    return next(action);
  }

  const { offline } = action.meta;
  const { effect, commit, rollback } = offline;

  // First, let the action go through
  next(action);

  // Check network status
  const isConnected = await offlineService.isNetworkAvailable();

  if (isConnected) {
    // We're online, try to perform the effect
    try {
      // Find the appropriate service and method
      const { endpoint, payload } = effect;
      const [serviceName, methodName] = endpoint.split(".");

      // Get the service from the store's extra argument
      const service = store.extra.services[serviceName];

      if (!service || !service[methodName]) {
        throw new Error(`Invalid endpoint: ${endpoint}`);
      }

      // Execute the API call
      const response = await service[methodName](payload);

      // Dispatch the commit action with the response
      if (commit) {
        const commitAction = {
          ...commit,
          payload: response.data,
        };

        store.dispatch(commitAction);
      }

      return response;
    } catch (error) {
      console.error("Offline effect error:", error);

      // Dispatch the rollback action with the error
      if (rollback) {
        const rollbackAction = {
          ...rollback,
          error: true,
          payload: error.message || "API request failed",
        };

        store.dispatch(rollbackAction);
      }

      // If it's a network error, queue it for later
      if (
        error.message === "Network Error" ||
        error.message === "Network request failed"
      ) {
        await offlineService.addPendingAction({
          type: action.type,
          effect,
          commit,
          rollback,
        });
      }

      throw error;
    }
  } else {
    // We're offline, queue the action for later
    await offlineService.addPendingAction({
      type: action.type,
      effect,
      commit,
      rollback,
    });

    // Immediately dispatch an optimistic update if needed
    if (commit) {
      const optimisticAction = {
        ...commit,
        meta: {
          ...commit.meta,
          optimistic: true,
        },
      };

      store.dispatch(optimisticAction);
    }
  }
};

export default offlineMiddleware;
