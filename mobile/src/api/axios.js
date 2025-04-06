import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Update with your actual server URL
const API_URL = "http://10.0.2.2:5000/api"; // Use this for Android emulator
// const API_URL = 'http://localhost:5000/api'; // Use this for iOS simulator

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error getting token", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
