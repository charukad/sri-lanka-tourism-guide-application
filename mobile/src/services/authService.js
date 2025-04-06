import api from "../api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Service for handling authentication-related API calls
const authService = {
  // Login with email and password
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    // Store the token in AsyncStorage for future requests
    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
    }

    return response;
  },

  // Register a new user
  register: async (username, email, password, userType) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
      userType,
    });

    // Store the token in AsyncStorage for future requests
    if (response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
    }

    return response;
  },

  // Check if there's a stored token and validate it
  checkAuthStatus: async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      return { isAuthenticated: false, user: null };
    }

    try {
      // Validate the token with the server
      const response = await api.get("/auth/me");
      return { isAuthenticated: true, user: response.data.user };
    } catch (error) {
      // If the token is invalid, clear it
      await AsyncStorage.removeItem("token");
      return { isAuthenticated: false, user: null };
    }
  },

  // Logout the user
  logout: async () => {
    await AsyncStorage.removeItem("token");
    // You might also want to make an API call to invalidate the token on the server
    // await api.post('/auth/logout');
  },
};

export default authService;
