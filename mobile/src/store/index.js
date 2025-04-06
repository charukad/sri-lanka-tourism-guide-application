import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import authSlice from "./slices/authSlice";

// Create the root reducer with our auth slice
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  // You'll add more reducers here as you develop them
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
