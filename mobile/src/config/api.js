import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000', // Update this with your actual API URL
  timeout: 10000, // 10 seconds
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Get the token from storage
      const token = await AsyncStorage.getItem('token');
      
      // If token exists, add it to the headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      const originalRequest = error.config;

      // Handle network errors
      if (!error.response) {
        console.error('Network error:', error);
        throw new Error('Network error. Please check your internet connection.');
      }

      // If the error is a 401 and we haven't tried to refresh the token yet
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get the refresh token
          const refreshToken = await AsyncStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Try to get a new token
          const response = await api.post('/api/auth/refresh-token', {
            refreshToken,
          });

          const { token } = response.data;

          // Save the new token
          await AsyncStorage.setItem('token', token);

          // Update the Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${token}`;

          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear storage and reject
          await AsyncStorage.multiRemove(['token', 'refreshToken']);
          throw new Error('Session expired. Please log in again.');
        }
      }

      // Handle other error statuses
      switch (error.response.status) {
        case 400:
          throw new Error(error.response.data?.message || 'Invalid request');
        case 403:
          throw new Error('You do not have permission to perform this action');
        case 404:
          throw new Error('Resource not found');
        case 500:
          throw new Error('Server error. Please try again later');
        default:
          throw new Error(error.response.data?.message || 'An error occurred');
      }
    } catch (interceptorError) {
      console.error('Response interceptor error:', interceptorError);
      return Promise.reject(interceptorError);
    }
  }
);

export default api; 