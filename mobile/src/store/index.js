import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import authReducer from "./slices/authSlice";
import itineraryReducer from "./slices/itinerarySlice";
import guideReducer from "./slices/guideSlice";

// Create the root reducer with our auth and itinerary slices
const rootReducer = combineReducers({
  auth: authReducer,
  itinerary: itineraryReducer,
  guides: guideReducer,
  // Add other reducers here
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
