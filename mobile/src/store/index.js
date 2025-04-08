import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";

// Import reducers
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import itineraryReducer from "./slices/itinerarySlice";
import guideSlice from "./slices/guideSlice";
import vehicleSlice from "./slices/vehicleSlice";
import socialSlice from "./slices/socialSlice";
import eventSlice from "./slices/eventSlice";

// Configure persistence
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  // Blacklist any large state slices that you don't want to persist
  blacklist: ["events"], // Example: you might not want to persist event data
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
