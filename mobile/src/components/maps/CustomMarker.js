import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";

const getCategoryIcon = (category) => {
  switch (category) {
    case "historical":
      return "account-balance";
    case "nature":
      return "nature";
    case "beach":
      return "beach-access";
    case "religious":
      return "temple-buddhist";
    case "scenic":
      return "landscape";
    default:
      return "place";
  }
};

const CustomMarker = ({ destination, onPress }) => {
  const { id, name, latitude, longitude, category, rating } = destination;
  const markerColor = getCategoryColor(category);
  const iconName = getCategoryIcon(category);

  return (
    <Marker
      key={id}
      coordinate={{
        latitude,
        longitude,
      }}
      title={name}
      description={`Rating: ${rating} ⭐`}
      onPress={() => onPress(destination)}
    >
      <View style={[styles.markerContainer, { backgroundColor: markerColor }]}>
        <MaterialIcons name={iconName} size={18} color="white" />
      </View>
    </Marker>
  );
};

const getCategoryColor = (category) => {
  switch (category) {
    case "historical":
      return "#FF6B6B"; // Red
    case "nature":
      return "#4CAF50"; // Green
    case "beach":
      return "#00BCD4"; // Light Blue
    case "religious":
      return "#9C27B0"; // Purple
    case "scenic":
      return "#FF9800"; // Orange
    default:
      return "#0066CC"; // Default Blue
  }
};

const styles = StyleSheet.create({
  markerContainer: {
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: "white",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default CustomMarker;
