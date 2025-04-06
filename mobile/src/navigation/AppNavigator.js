import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View } from "react-native";

// Import real screens for auth
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder component for screens we haven't built yet
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Screen: {route.name}</Text>
  </View>
);

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Explore" component={PlaceholderScreen} />
      <Tab.Screen name="Itineraries" component={PlaceholderScreen} />
      <Tab.Screen name="Feed" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

// Root navigator
const AppNavigator = () => {
  // For development, we'll set this to false so we can test auth screens
  const isAuthenticated = false;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
