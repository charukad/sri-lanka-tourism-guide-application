import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
  StatusBar,
  Linking,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { addDestinationToDay } from "../../store/slices/itinerarySlice";
import { destinations } from "../../data/destinations";

const { width } = Dimensions.get("window");

const DestinationDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { destination } = route.params;
  const { itineraries } = useSelector((state) => state.itinerary);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const flatListRef = useRef(null);

  // Fetch complete destination data if needed
  // In a real app, this might be an API call using an ID
  const destinationData = React.useMemo(() => {
    if (typeof destination.id === "string") {
      // If we have a minimal destination object (just ID), fetch the full data
      return destinations.find((d) => d.id === destination.id) || destination;
    }
    return destination;
  }, [destination]);

  // On scroll end, update active image index
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveImageIndex(index);
  };

  // Get appropriate color for the destination category
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

  // Get readable category name
  const getCategoryName = (category) => {
    switch (category) {
      case "historical":
        return "Historical Site";
      case "nature":
        return "Nature & Wildlife";
      case "beach":
        return "Beach";
      case "religious":
        return "Religious Site";
      case "scenic":
        return "Scenic View";
      default:
        return "Destination";
    }
  };

  // Handle "Add to Itinerary" button press
  const handleAddToItinerary = () => {
    if (itineraries.length === 0) {
      // If no itineraries, prompt to create one
      Alert.alert(
        "No Itineraries",
        "You need to create an itinerary first before adding destinations.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Create Itinerary",
            onPress: () => navigation.navigate("CreateItinerary"),
          },
        ]
      );
    } else {
      // Navigate to itinerary selector
      navigation.navigate("AddToItinerary", { destination: destinationData });
    }
  };

  // Handle opening maps for directions
  const handleGetDirections = () => {
    const { latitude, longitude } = destinationData;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
        );
      }
    });
  };

  // Handle share button
  const handleShare = () => {
    // In a real app, would use Share API
    Alert.alert(
      "Share this Destination",
      "Sharing functionality will be implemented in a future update.",
      [{ text: "OK", style: "default" }]
    );
  };

  // Render image for the slider
  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.sliderImageContainer}
      // In a full app, this would open an image viewer
      onPress={() => {}}
    >
      <Image
        source={{ uri: item }}
        style={styles.sliderImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with back button and share */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <MaterialIcons name="share" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Image slider */}
        <View style={styles.sliderContainer}>
          <FlatList
            ref={flatListRef}
            data={
              destinationData.image
                ? [destinationData.image]
                : destinationData.images || [destinationData.image]
            }
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          />

          {/* Image indicators if multiple images */}
          {destinationData.images && destinationData.images.length > 1 && (
            <View style={styles.indicatorsContainer}>
              {destinationData.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    activeImageIndex === index && styles.activeIndicator,
                  ]}
                  onPress={() => {
                    setActiveImageIndex(index);
                    flatListRef.current?.scrollToIndex({
                      index,
                      animated: true,
                    });
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Content section */}
        <View style={styles.contentContainer}>
          {/* Title and category */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{destinationData.name}</Text>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(destinationData.category) },
              ]}
            >
              <Text style={styles.categoryText}>
                {getCategoryName(destinationData.category)}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={20} color="#FFC107" />
            <Text style={styles.rating}>{destinationData.rating}</Text>
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text
              style={styles.description}
              numberOfLines={isDescriptionExpanded ? undefined : 4}
            >
              {destinationData.description}
            </Text>
            {destinationData.description.length > 200 && (
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <Text style={styles.expandButtonText}>
                  {isDescriptionExpanded ? "Read less" : "Read more"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Information sections */}
          {destinationData.openingHours && (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MaterialIcons name="access-time" size={20} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Opening Hours</Text>
                  <Text style={styles.infoText}>
                    {destinationData.openingHours}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {destinationData.entranceFee && (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MaterialIcons name="local-atm" size={20} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Entrance Fee</Text>
                  <Text style={styles.infoText}>
                    {destinationData.entranceFee}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {destinationData.bestTimeToVisit && (
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MaterialIcons name="event" size={20} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Best Time to Visit</Text>
                  <Text style={styles.infoText}>
                    {destinationData.bestTimeToVisit}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Activities */}
          {destinationData.activities &&
            destinationData.activities.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Activities</Text>
                <View style={styles.activitiesContainer}>
                  {destinationData.activities.map((activity, index) => (
                    <View key={index} style={styles.activityBadge}>
                      <Text style={styles.activityText}>{activity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {/* Location on map placeholder */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapPlaceholder}>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={handleGetDirections}
              >
                <MaterialIcons name="directions" size={20} color="white" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddToItinerary}
            >
              <MaterialIcons name="add-to-photos" size={20} color="white" />
              <Text style={styles.actionButtonText}>Add to Itinerary</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={20} color="white" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom padding for scroll */}
          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 40 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  sliderContainer: {
    height: 250,
    width: width,
  },
  sliderImageContainer: {
    width: width,
    height: 250,
  },
  sliderImage: {
    width: width,
    height: 250,
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: "white",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  contentContainer: {
    padding: 20,
  },
  titleContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
  categoryText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  expandButton: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  expandButtonText: {
    color: "#0066CC",
    fontWeight: "500",
  },
  infoSection: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
  },
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  activityBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  activityText: {
    color: "#555",
    fontSize: 14,
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  directionsButton: {
    flexDirection: "row",
    backgroundColor: "#0066CC",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  directionsButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  secondaryButton: {
    backgroundColor: "#FF6B6B",
    marginRight: 0,
    marginLeft: 10,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default DestinationDetailsScreen;
