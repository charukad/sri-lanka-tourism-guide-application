import React, { useEffect } from "react";
import { LogBox } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { customFonts } from "./constants/fonts";
import "./i18n";

// Import store from the correct path
import store, { persistor } from "./src/store";
import AppNavigator from "./navigation/AppNavigator";
import { checkAuthStatus } from "./src/store/slices/authSlice";
import offlineService from "./services/offlineService";
import locationService from "./services/locationService";
import eventService from "./services/eventService";
import guideService from "./services/guideService";
import vehicleService from "./services/vehicleService";

// Ignore specific warnings
LogBox.ignoreLogs([
  "ReactNativeFiberHostComponent: Calling getNode() on the ref of an Animated component",
  "Setting a timer for a long period of time",
]);

// Keep the splash screen visible until we're done loading
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [fontsLoaded] = useFonts(customFonts);

  useEffect(() => {
    const initializeApp = async () => {
      // Check if user is authenticated
      store.dispatch(checkAuthStatus());

      // Initialize offline service
      offlineService.initOfflineSync({
        syncInterval: 5 * 60 * 1000, // 5 minutes
        apiServices: {
          locationService,
          eventService,
          guideService,
          vehicleService,
        },
      });

      // Pre-cache essential data
      if (await offlineService.isNetworkAvailable()) {
        try {
          const [locationsResponse, eventsResponse] = await Promise.all([
            locationService.getAllLocations({ limit: 100 }),
            eventService.getAllEvents({ limit: 50 }),
          ]);

          await offlineService.saveOfflineData(
            offlineService.STORAGE_KEYS.LOCATIONS,
            locationsResponse.data
          );

          await offlineService.saveOfflineData(
            offlineService.STORAGE_KEYS.EVENTS,
            eventsResponse.data
          );

          console.log("Initial data cached for offline use");
        } catch (error) {
          console.error("Error pre-caching data:", error);
        }
      }

      // Hide splash screen once everything is initialized
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
