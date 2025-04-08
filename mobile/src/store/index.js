import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createMigrate, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { autoMergeLevel2 } from "redux-persist/lib/stateReconciler";

// Import reducers
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import itineraryReducer from "./slices/itinerarySlice";
import guideSlice from "./slices/guideSlice";
import vehicleSlice from "./slices/vehicleSlice";
import socialSlice from "./slices/socialSlice";
import eventSlice from "./slices/eventSlice";

// Migrations for future schema changes
const migrations = {
  0: (state) => {
    // Initial state
    return state;
  },
  // Add future migrations here
};

// Configure persistence
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  // Enhanced error handling for persist rehydration
  transforms: [
    {
      in: (state, key) => {
        try {
          // Validate state before storing
          if (state === null || state === undefined) {
            console.warn(`Invalid state for key ${key}, using initial state`);
            return undefined;
          }
          return state;
        } catch (error) {
          console.error(`Transform in error for key ${key}:`, error);
          return undefined;
        }
      },
      out: (state, key) => {
        try {
          // Validate state when retrieving
          if (state === null || state === undefined) {
            console.warn(`Invalid state for key ${key}, using initial state`);
            return undefined;
          }
          return state;
        } catch (error) {
          console.error(`Transform out error for key ${key}:`, error);
          return undefined;
        }
      }
    }
  ],
  // Enhanced write failure handler
  writeFailHandler: (error) => {
    console.warn('Redux persist write failed:', error);
    if (error.message && error.message.includes('C++ exception')) {
      (async () => {
        try {
          await AsyncStorage.clear();
          console.log('AsyncStorage cleared due to C++ exception in persist write');
          // Purge persist store
          persistor.purge();
        } catch (cleanupError) {
          console.error('Failed to perform cleanup:', cleanupError);
        }
      })();
    }
  },
  // Blacklist potentially problematic state slices
  blacklist: [
    "events",
    "offline", // Blacklist offline state to prevent corruption
    "socket"   // Blacklist socket state
  ],
  // Increase timeout for slower devices
  timeout: 20000
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  itinerary: itineraryReducer,
  guides: guideSlice,
  vehicles: vehicleSlice,
  social: socialSlice,
  events: eventSlice,
});

// Create persisted reducer with error handling
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with middleware
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // Add any custom action types that might contain non-serializable data
          'user/uploadProfilePicture',
          'auth/login',
          'auth/register',
          'auth/checkStatus',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'meta.arg',
          'payload.timestamp',
          'payload.formData',
          'payload.file',
          'error',
          'meta.baseQueryMeta',
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'items.dates',
          'user.profile.image',
          'error',
          'auth.error',
          'offline.pendingActions',
        ],
      },
      immutableCheck: false, // Disable immutable state invariant check in production
      thunk: {
        extraArgument: undefined,
        timeout: 15000, // Increase timeout for slower devices
      },
    }),
  devTools: __DEV__,
});

// Create persistor using the existing persistConfig
const persistor = persistStore(store, null, () => {
  console.log('Rehydration completed');
});

// Handle store errors with more detailed logging
store.subscribe(() => {
  try {
    const state = store.getState();
    if (state.error) {
      console.error('Store error:', {
        error: state.error,
        action: state.lastAction,
        state: JSON.stringify(state, (key, value) => {
          // Handle circular references and non-serializable values
          if (typeof value === 'object' && value !== null) {
            try {
              JSON.stringify(value);
              return value;
            } catch (err) {
              return '[Circular or Non-Serializable]';
            }
          }
          return value;
        }, 2)
      });
    }
  } catch (error) {
    console.error('Error in store subscription:', error);
  }
});

// Add error boundary for async operations with better error handling
const originalDispatch = store.dispatch;
store.dispatch = (action) => {
  try {
    if (action instanceof Promise) {
      return action
        .then(resolvedAction => {
          if (resolvedAction) {
            try {
              return originalDispatch(resolvedAction);
            } catch (error) {
              console.error('Error dispatching resolved action:', error);
              throw error;
            }
          }
        })
        .catch(error => {
          console.error('Async action error:', error);
          // Dispatch an error action if needed
          originalDispatch({ type: 'ERROR', payload: error.message });
          return Promise.reject(error);
        });
    }
    return originalDispatch(action);
  } catch (error) {
    console.error('Sync action error:', error);
    // Dispatch an error action if needed
    originalDispatch({ type: 'ERROR', payload: error.message });
    throw error;
  }
};

export { store, persistor };
export default store;

