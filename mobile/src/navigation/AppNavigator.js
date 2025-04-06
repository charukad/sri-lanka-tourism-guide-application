import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthStatus } from "../store/slices/authSlice";
import { loadItineraries } from "../store/slices/itinerarySlice";

// Import authentication screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Import Explore-related screens
import ExploreScreen from "../screens/maps/ExploreScreen";
import DestinationDetailsScreen from "../screens/maps/DestinationDetailsScreen";

// Import Itinerary-related screens
import ItinerariesScreen from "../screens/itinerary/ItinerariesScreen";
import ItineraryDetailsScreen from "../screens/itinerary/ItineraryDetailsScreen";
import CreateItineraryScreen from "../screens/itinerary/CreateItineraryScreen";
import AddToItineraryScreen from "../screens/itinerary/AddToItineraryScreen";

// Import other screens
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import GuidesScreen from "../screens/guides/GuidesScreen";
import GuideDetailsScreen from "../screens/guides/GuideDetailsScreen";
import BookGuideScreen from "../screens/guides/BookGuideScreen";
import MyBookingsScreen from "../screens/guides/MyBookingsScreen";

// Create navigation containers
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ExploreStack = createStackNavigator();
const ItineraryStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const GuidesStack = createStackNavigator();

// Placeholder component for screens that haven't been built yet
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 18 }}>Screen: {route.name}</Text>
    <Text style={{ marginTop: 20, color: "#666" }}>
      This screen is under development
    </Text>
  </View>
);

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

// Nested stack navigator for Profile tab
const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
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
          } else if (route.name === "Feed") {
            iconName = "photo-library";
          } else if (route.name === "Profile") {
            iconName = "person";
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
      <Tab.Screen name="Feed" component={PlaceholderScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={({ route }) => ({
          tabBarStyle: ((route) => {
            const routeName = getFocusedRouteNameFromRoute(route) ?? "";
            const hideOnScreens = ["EditProfile"];
            return hideOnScreens.includes(routeName)
              ? { display: "none" }
              : { height: 60, paddingBottom: 5 };
          })(route),
        })}
      />
    </Tab.Navigator>
  );
};

// Helper function to get the current screen name
const getFocusedRouteNameFromRoute = (route) => {
  if (route.state && route.state.routeNames) {
    return route.state.routeNames[route.state.index];
  }
  return route.params?.screen || "";
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

  // Load auth status and itineraries when the app starts
  useEffect(() => {
    dispatch(checkAuthStatus());
    dispatch(loadItineraries());
  }, [dispatch]);

  // Show loading screen while checking authentication
  if (!authChecked || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0066cc" />
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
