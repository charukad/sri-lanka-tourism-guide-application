import React, { useEffect, useState } from "react";
import { LogBox, View, ActivityIndicator, Text, TouchableOpacity, Platform } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { customFonts } from "./src/constants/fonts";
import "./src/i18n";

// Set up global error handler
if (__DEV__) {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Check if the error is a C++ exception
    if (args[0] && typeof args[0] === 'string' && args[0].includes('non-std C++ exception')) {
      console.log('C++ Exception Details:', {
        message: args[0],
        stack: args[1]?.stack || 'No stack trace',
        additionalInfo: args.slice(2)
      });
      
      // Attempt to clean up on C++ exception
      (async () => {
        try {
          await AsyncStorage.clear();
          console.log('AsyncStorage cleared due to C++ exception');
          // Force app reload after cleanup
          if (Platform.OS === 'web') {
            window.location.reload();
          } else {
            try {
              await Updates.reloadAsync();
            } catch (reloadError) {
              console.error('Failed to reload app:', reloadError);
            }
          }
        } catch (cleanupError) {
          console.error('Failed to perform cleanup:', cleanupError);
        }
      })();
    }
    originalConsoleError.apply(console, args);
  };
}

// Add global error handler for promises
const globalErrorHandler = async (error, isFatal) => {
  if (isFatal) {
    console.error('Fatal Error:', error);
    
    try {
      // Clear AsyncStorage on fatal errors
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared due to fatal error');
      
      // Additional cleanup for C++ exceptions
      if (error.message?.includes('C++ exception')) {
        // Clear redux persist storage
        await persistor.purge();
        console.log('Redux persist storage purged');
      }
    } catch (cleanupError) {
      console.error('Failed to clear storage:', cleanupError);
    }
  }
};

// Register the error handler
if (global.ErrorUtils) {
  global.ErrorUtils.setGlobalHandler(globalErrorHandler);
}

// Ensure promises are handled
if (!global.__DEV__) {
  global.Promise = require('promise/setimmediate');
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import store from the correct path
import store, { persistor } from "./src/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { checkAuthStatus } from "./src/store/slices/authSlice";
import offlineService from "./src/services/offlineService";
import locationService from "./src/services/locationService";
import eventService from "./src/services/eventService";
import guideService from "./src/services/guideService";
import vehicleService from "./src/services/vehicleService";

// Ignore specific warnings
LogBox.ignoreLogs([
  "ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component",
  "Setting a timer for a long period of time",
  "AsyncStorage has been extracted from react-native",
]);

// Keep the splash screen visible until we're done loading
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ color: '#666', textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wrap AsyncStorage operations in try-catch
        const testAsyncStorage = async () => {
          return Promise.race([
            new Promise(async (resolve, reject) => {
              try {
                await AsyncStorage.setItem('test-key', 'test-value');
                await AsyncStorage.removeItem('test-key');
                resolve();
              } catch (error) {
                reject(new Error(`AsyncStorage test failed: ${error.message}`));
              }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('AsyncStorage test timed out')), 3000)
            )
          ]);
        };

        // Test AsyncStorage first
        try {
          await testAsyncStorage();
        } catch (storageError) {
          console.error("Critical AsyncStorage error:", storageError);
          throw new Error(`AsyncStorage initialization failed: ${storageError.message}`);
        }

        // Initialize services with better error boundaries
        const initializeWithTimeout = async (promise, timeoutMs = 5000, name = 'operation') => {
          try {
            return await Promise.race([
              promise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`${name} timed out after ${timeoutMs}ms`)), timeoutMs)
              )
            ]);
          } catch (error) {
            console.error(`Error in ${name}:`, error);
            // Rethrow with more context
            throw new Error(`${name} failed: ${error.message}`);
          }
        };

        // 1. Check authentication first with retry
        let authRetries = 2;
        while (authRetries > 0) {
          try {
            await initializeWithTimeout(
              store.dispatch(checkAuthStatus()).unwrap(),
              5000,
              'authentication check'
            );
            break;
          } catch (error) {
            authRetries--;
            if (authRetries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          }
        }

        // 2. Initialize offline service with reduced initial sync and better error handling
        try {
          await initializeWithTimeout(
            offlineService.initOfflineSync({
              syncInterval: 5 * 60 * 1000, // 5 minutes
              apiServices: {
                locationService,
                eventService,
                guideService,
                vehicleService,
              },
              maxRetries: 2,
              retryDelay: 1000,
            }),
            10000,
            'offline sync initialization'
          );
        } catch (error) {
          console.warn('Offline sync initialization failed:', error);
          // Continue as offline sync is not critical for app function
        }

        // 3. Pre-cache essential data only if network is available
        try {
          const isNetworkAvailable = await offlineService.isNetworkAvailable();
          if (isNetworkAvailable) {
            const [locationsResponse, eventsResponse] = await Promise.all([
              initializeWithTimeout(
                locationService.getAllLocations({ limit: 50 }),
                5000,
                'locations fetch'
              ),
              initializeWithTimeout(
                eventService.getAllEvents({ limit: 25 }),
                5000,
                'events fetch'
              ),
            ]);

            await Promise.all([
              initializeWithTimeout(
                offlineService.saveOfflineData(
                  offlineService.STORAGE_KEYS.LOCATIONS,
                  locationsResponse.data
                ),
                3000,
                'locations cache'
              ),
              initializeWithTimeout(
                offlineService.saveOfflineData(
                  offlineService.STORAGE_KEYS.EVENTS,
                  eventsResponse.data
                ),
                3000,
                'events cache'
              ),
            ]);
          }
        } catch (error) {
          console.warn('Non-critical cache error:', error);
          // Continue as caching is not critical
        }

        setIsReady(true);
      } catch (error) {
        console.error("Critical app initialization error:", error);
        setInitError(error);
        // Ensure splash screen is hidden even on error
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("Error hiding splash screen:", e);
        }
        return; // Exit initialization on critical error
      }
    };

    initializeApp();
  }, []);

  // Show a more detailed error screen
  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: '#ff3b30' }}>Initialization Error</Text>
        <Text style={{ color: '#666', textAlign: 'center', marginBottom: 20 }}>
          {initError.message || 'Failed to initialize the app'}
        </Text>
        <TouchableOpacity 
          onPress={() => {
            setInitError(null);
            setIsReady(false);
            // Attempt to reinitialize
            initializeApp();
          }}
          style={{
            padding: 10,
            backgroundColor: '#007AFF',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ marginTop: 15, fontSize: 16, color: '#666' }}>
          Loading Sri Lanka Tourism Guide...
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NavigationContainer>
                <StatusBar style="auto" />
                <AppNavigator />
              </NavigationContainer>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
