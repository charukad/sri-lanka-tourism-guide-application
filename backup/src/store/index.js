import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import thunk from "redux-thunk";

// Import reducers (will create these later)
// import authReducer from './slices/authSlice';

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth"], // only auth will be persisted
};

const rootReducer = combineReducers({
  // auth: authReducer,
  // Add other reducers here
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
});

export const persistor = persistStore(store);
