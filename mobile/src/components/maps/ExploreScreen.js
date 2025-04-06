import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";

// Components
import CustomMarker from "../../components/maps/CustomMarker";
import SearchBar from "../../components/maps/SearchBar";
import CategoryFilter from "../../components/maps/CategoryFilter";

// Data
import { destinations, categories } from "../../data/destinations";

const ExploreScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDestinations, setFilteredDestinations] =
    useState(destinations);
  const [currentRegion, setCurrentRegion] = useState({
    latitude: 7.8731, // Center of Sri Lanka
    longitude: 80.7718,
    latitudeDelta: 3,
    longitudeDelta: 3,
  });

  const mapRef = useRef(null);

  // Filter destinations based on category and search query
  useEffect(() => {
    let filtered = destinations;

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((dest) => dest.category === selectedCategory);
    }

    // Apply search filter if there's a query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(query) ||
          dest.description.toLowerCase().includes(query)
      );
    }

    setFilteredDestinations(filtered);
  }, [selectedCategory, searchQuery]);

  // Handle marker press - navigate to destination details
  const handleMarkerPress = (destination) => {
    // For now, just log. We'll implement the details screen later.
    console.log("Selected destination:", destination.name);
    // navigation.navigate('DestinationDetails', { destination });
  };

  // Handle search submission
  const handleSearch = () => {
    // If we have exactly one result after filtering, zoom to it
    if (filteredDestinations.length === 1) {
      const dest = filteredDestinations[0];
      mapRef.current?.animateToRegion(
        {
          latitude: dest.latitude,
          longitude: dest.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        },
        1000
      );
    }
  };

  // Reset map to show all of Sri Lanka
  const resetMapView = () => {
    mapRef.current?.animateToRegion(
      {
        latitude: 7.8731,
        longitude: 80.7718,
        latitudeDelta: 3,
        longitudeDelta: 3,
      },
      1000
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={currentRegion}
        onRegionChangeComplete={setCurrentRegion}
      >
        {filteredDestinations.map((destination) => (
          <CustomMarker
            key={destination.id}
            destination={destination}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Reset map button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetMapView}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>

      {/* Destination count indicator */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredDestinations.length}{" "}
          {filteredDestinations.length === 1 ? "destination" : "destinations"}{" "}
          found
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  resetButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#0066CC",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  countContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  countText: {
    color: "white",
    fontSize: 14,
  },
});

export default ExploreScreen;
