import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthStatus } from "../store/slices/authSlice";
import { loadItineraries } from "../store/slices/itinerarySlice";
import { fetchGuides } from "../store/slices/guideSlice";
import { fetchVehicles } from "../store/slices/vehicleSlice";

// Import authentication screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Import explore and map-related screens
import ExploreScreen from "../screens/maps/ExploreScreen";
import DestinationDetailsScreen from "../screens/maps/DestinationDetailsScreen";

// Import itinerary-related screens
import ItinerariesScreen from "../screens/itinerary/ItinerariesScreen";
import ItineraryDetailsScreen from "../screens/itinerary/ItineraryDetailsScreen";
import CreateItineraryScreen from "../screens/itinerary/CreateItineraryScreen";
import AddToItineraryScreen from "../screens/itinerary/AddToItineraryScreen";

// Import guide-related screens
import GuidesScreen from "../screens/guides/GuidesScreen";
import GuideDetailsScreen from "../screens/guides/GuideDetailsScreen";
import BookGuideScreen from "../screens/guides/BookGuideScreen";
import MyBookingsScreen from "../screens/guides/MyBookingsScreen";

// Import vehicle-related screens
import VehiclesScreen from "../screens/vehicles/VehiclesScreen";
import VehicleDetailsScreen from "../screens/vehicles/VehicleDetailsScreen";
import BookVehicleScreen from "../screens/vehicles/BookVehicleScreen";
import MyVehicleBookingsScreen from "../screens/vehicles/MyVehicleBookingsScreen";

// Import profile-related screens
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";

import EventsScreen from "../screens/events/EventsScreen";
import EventDetailsScreen from "../screens/events/EventDetailsScreen";
import EventCalendarScreen from "../screens/events/EventCalendarScreen";

// Create navigation containers
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ExploreStack = createStackNavigator();
const ItineraryStack = createStackNavigator();
const GuidesStack = createStackNavigator();
const VehiclesStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Helper function to get the current screen name
const getFocusedRouteNameFromRoute = (route) => {
  if (route.state && route.state.routeNames) {
    return route.state.routeNames[route.state.index];
  }
  return route.params?.screen || "";
};

// Nested stack navigator for Explore tab
const ExploreStackScreen = () => {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreMap" component={ExploreScreen} />
      <ExploreStack.Screen
        name="DestinationDetails"
        component={DestinationDetailsScreen}
        options={{
          cardStyle: { backgroundColor: "white" },
          cardOverlayEnabled: true,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress,
            },
          }),
        }}
      />
      <ExploreStack.Screen
        name="AddToItinerary"
        component={AddToItineraryScreen}
      />
    </ExploreStack.Navigator>
  );
};

// Nested stack navigator for Itinerary tab
const ItineraryStackScreen = () => {
  return (
    <ItineraryStack.Navigator screenOptions={{ headerShown: false }}>
      <ItineraryStack.Screen
        name="ItinerariesList"
        component={ItinerariesScreen}
      />
      <ItineraryStack.Screen
        name="ItineraryDetails"
        component={ItineraryDetailsScreen}
      />
      <ItineraryStack.Screen
        name="CreateItinerary"
        component={CreateItineraryScreen}
      />
      <ItineraryStack.Screen
        name="AddToItinerary"
        component={AddToItineraryScreen}
      />
      <ItineraryStack.Screen
        name="ExploreForItinerary"
        component={ExploreScreen}
        initialParams={{ fromItinerary: true }}
      />
      <ItineraryStack.Screen
        name="DestinationDetails"
        component={DestinationDetailsScreen}
      />
    </ItineraryStack.Navigator>
  );
};

// Nested stack navigator for Guides tab
const GuidesStackScreen = () => {
  return (
    <GuidesStack.Navigator screenOptions={{ headerShown: false }}>
      <GuidesStack.Screen name="GuidesList" component={GuidesScreen} />
      <GuidesStack.Screen name="GuideDetails" component={GuideDetailsScreen} />
      <GuidesStack.Screen name="BookGuide" component={BookGuideScreen} />
      <GuidesStack.Screen name="MyBookings" component={MyBookingsScreen} />
    </GuidesStack.Navigator>
  );
};

// Nested stack navigator for Vehicles tab
const VehiclesStackScreen = () => {
  return (
    <VehiclesStack.Navigator screenOptions={{ headerShown: false }}>
      <VehiclesStack.Screen name="VehiclesList" component={VehiclesScreen} />
      <VehiclesStack.Screen
        name="VehicleDetails"
        component={VehicleDetailsScreen}
      />
      <VehiclesStack.Screen name="BookVehicle" component={BookVehicleScreen} />
      <VehiclesStack.Screen
        name="MyVehicleBookings"
        component={MyVehicleBookingsScreen}
      />
    </VehiclesStack.Navigator>
  );
};

// Nested stack navigator for Profile tab
const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="MyBookings" component={MyBookingsScreen} />
      <ProfileStack.Screen
        name="MyVehicleBookings"
        component={MyVehicleBookingsScreen}
      />
    </ProfileStack.Navigator>
  );
};

// Main tab navigator for authenticated users
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Explore") {
            iconName = "explore";
          } else if (route.name === "Itineraries") {
            iconName = "map";
          } else if (route.name === "Guides") {
            iconName = "person";
          } else if (route.name === "Vehicles") {
            iconName = "directions-car";
          } else if (route.name === "Profile") {
            iconName = "account-circle";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#0066cc",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreStackScreen}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "";
            const hideOnScreens = ["DestinationDetails", "AddToItinerary"];
            return hideOnScreens.includes(routeName)
              ? { display: "none" }
              : { height: 60, paddingBottom: 5 };
          })(route),
        })}
      />
      <Tab.Screen
        name="Itineraries"
        component={ItineraryStackScreen}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "";
            const hideOnScreens = [
              "ItineraryDetails",
              "CreateItinerary",
              "AddToItinerary",
              "ExploreForItinerary",
              "DestinationDetails",
            ];
            return hideOnScreens.includes(routeName)
              ? { display: "none" }
              : { height: 60, paddingBottom: 5 };
          })(route),
        })}
      />
      <Tab.Screen
        name="Guides"
        component={GuidesStackScreen}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "";
            const hideOnScreens = ["GuideDetails", "BookGuide", "MyBookings"];
            return hideOnScreens.includes(routeName)
              ? { display: "none" }
              : { height: 60, paddingBottom: 5 };
          })(route),
        })}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehiclesStackScreen}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "";
            const hideOnScreens = [
              "VehicleDetails",
              "BookVehicle",
              "MyVehicleBookings",
            ];
            return hideOnScreens.includes(routeName)
              ? { display: "none" }
              : { height: 60, paddingBottom: 5 };
          })(route),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "";
            const hideOnScreens = [
              "EditProfile",
              "Settings",
              "MyBookings",
              "MyVehicleBookings",
            ];
            return hideOnScreens.includes(routeName)
              ? { display: "none" }
              : { height: 60, paddingBottom: 5 };
          })(route),
        })}
      />
    </Tab.Navigator>
  );
};

// Auth navigator for non-authenticated users
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Root navigator - controls auth flow
const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, authChecked } = useSelector(
    (state) => state.auth
  );

  // Load important data when the app starts
  useEffect(() => {
    // Check authentication status
    dispatch(checkAuthStatus());

    // Load other initial data
    dispatch(loadItineraries());
    dispatch(fetchGuides());
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (!authChecked || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ marginTop: 15, fontSize: 16, color: "#666" }}>
          Loading Sri Lanka Tourism Guide...
        </Text>
      </View>
    );
  }

  // Return the appropriate navigator based on authentication status
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
