import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";

// Import your reducers
import authReducer from "./src/store/slices/authSlice";
import userReducer from "./src/store/slices/userSlice";
import itineraryReducer from "./src/store/slices/itinerarySlice";

// Import other reducers as needed

// Configure persistence
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  // Blacklist any large state slices that you don't want to persist
  blacklist: ["someReducerWithTransientData"],
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  itinerary: itineraryReducer,
  // Other reducers
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with middleware
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    }),
});

// Create persistor
const persistor = persistStore(store);

export { store, persistor };
export default store;
