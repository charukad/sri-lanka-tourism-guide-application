import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
  Keyboard,
  StatusBar,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import {
  addDestinationToDay,
  saveItineraries,
} from "../../store/slices/itinerarySlice";

// Components
import CustomMarker from "../../components/maps/CustomMarker";
import SearchBar from "../../components/maps/SearchBar";
import CategoryFilter from "../../components/maps/CategoryFilter";

// Data
import { destinations, categories } from "../../data/destinations";

const ExploreScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();

  // Check if we're coming from itinerary to add a destination
  const isFromItinerary = route.params?.fromItinerary || false;
  const itineraryId = route.params?.itineraryId;
  const dayNumber = route.params?.dayNumber;

  // State for map and filtering
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const mapRef = useRef(null);

  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

  // Handle marker press - navigate to destination details or add to itinerary
  const handleMarkerPress = (destination) => {
    // If coming from itinerary, add destination to that day
    if (isFromItinerary && itineraryId && dayNumber) {
      dispatch(
        addDestinationToDay({
          itineraryId,
          dayNumber,
          destination,
        })
      );

      Alert.alert(
        "Success",
        `${destination.name} has been added to your itinerary`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } else {
      // Regular navigation to details
      navigation.navigate("DestinationDetails", { destination });
    }
  };

  // Handle search submission
  const handleSearch = () => {
    Keyboard.dismiss();

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
    } else if (filteredDestinations.length > 1) {
      // If we have multiple results, fit the map to show all of them
      mapRef.current?.fitToCoordinates(
        filteredDestinations.map((dest) => ({
          latitude: dest.latitude,
          longitude: dest.longitude,
        })),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Special header for itinerary mode */}
      {isFromItinerary ? (
        <View style={styles.itineraryHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select a Destination</Text>
          <View style={styles.placeholder} />
        </View>
      ) : (
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />
      )}

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={currentRegion}
        onRegionChangeComplete={setCurrentRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
      >
        {filteredDestinations.map((destination) => (
          <CustomMarker
            key={destination.id}
            destination={destination}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {/* Map control buttons */}
      <View style={styles.mapControlsContainer}>
        <TouchableOpacity
          style={styles.mapControlButton}
          onPress={resetMapView}
        >
          <MaterialIcons name="my-location" size={24} color="#0066cc" />
        </TouchableOpacity>
      </View>

      {/* Destination count indicator */}
      <View style={[styles.countContainer, keyboardVisible && { bottom: 60 }]}>
        <Text style={styles.countText}>
          {filteredDestinations.length}{" "}
          {filteredDestinations.length === 1 ? "destination" : "destinations"}{" "}
          found
        </Text>
      </View>

      {/* Special instructions for itinerary mode */}
      {isFromItinerary && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Tap on a marker to add it to your itinerary
          </Text>
        </View>
      )}
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
  itineraryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  mapControlsContainer: {
    position: "absolute",
    top: 150,
    right: 15,
  },
  mapControlButton: {
    backgroundColor: "white",
    borderRadius: 30,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
  instructionsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    backgroundColor: "rgba(0, 102, 204, 0.8)",
    color: "white",
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
});

export default ExploreScreen;
