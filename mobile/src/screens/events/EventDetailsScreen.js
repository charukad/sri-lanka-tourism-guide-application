import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchEventById } from "../../store/slices/eventSlice";

const { width } = Dimensions.get("window");

const EventDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { eventId } = route.params;
  const { currentEvent, loading } = useSelector((state) => state.events);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef(null);

  // Fetch event details when component mounts
  useEffect(() => {
    dispatch(fetchEventById(eventId));
  }, [dispatch, eventId]);

  if (loading || !currentEvent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Calculate event status (upcoming, ongoing, past)
  const getEventStatus = () => {
    const now = new Date();
    const start = new Date(currentEvent.startDate);
    const end = new Date(currentEvent.endDate);

    if (now < start) {
      return { label: "Upcoming", color: "#0066cc" };
    } else if (now >= start && now <= end) {
      return { label: "Ongoing", color: "#4CAF50" };
    } else {
      return { label: "Past", color: "#757575" };
    }
  };

  const eventStatus = getEventStatus();

  // Calculate remaining days until event
  const getRemainingDays = () => {
    const now = new Date();
    const start = new Date(currentEvent.startDate);
    const diffTime = start - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Handle image slide
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveImageIndex(index);
  };

  // Handle indicator press
  const handleIndicatorPress = (index) => {
    setActiveImageIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // Render image for the slider
  const renderImageItem = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={styles.sliderImage}
      resizeMode="cover"
    />
  );

  // Handle opening a map to the location
  const handleOpenMap = () => {
    const { latitude, longitude } = currentEvent.location;
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

  // Handle adding event to itinerary
  const handleAddToItinerary = () => {
    navigation.navigate("AddToItinerary", {
      destination: {
        id: currentEvent._id,
        name: currentEvent.name,
        latitude: currentEvent.location.latitude,
        longitude: currentEvent.location.longitude,
        category: "event",
        image: currentEvent.images[0],
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color="#333" />
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
            data={currentEvent.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          />

          {/* Image indicators */}
          {currentEvent.images.length > 1 && (
            <View style={styles.indicatorsContainer}>
              {currentEvent.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.indicator,
                    activeImageIndex === index && styles.activeIndicator,
                  ]}
                  onPress={() => handleIndicatorPress(index)}
                />
              ))}
            </View>
          )}

          {/* Status badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: eventStatus.color + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: eventStatus.color }]}>
              {eventStatus.label}
            </Text>
          </View>
        </View>

        {/* Event content */}
        <View style={styles.contentContainer}>
          <Text style={styles.eventTitle}>{currentEvent.name}</Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {currentEvent.category.charAt(0).toUpperCase() +
                currentEvent.category.slice(1)}
            </Text>
          </View>

          {eventStatus.label === "Upcoming" && (
            <View style={styles.countdownContainer}>
              <MaterialIcons name="timer" size={20} color="#0066cc" />
              <Text style={styles.countdownText}>
                Starts in {getRemainingDays()} days
              </Text>
            </View>
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <MaterialIcons name="event" size={20} color="#666" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoText}>
                  {formatDate(currentEvent.startDate)}
                  {currentEvent.startDate !== currentEvent.endDate && (
                    <Text> - {formatDate(currentEvent.endDate)}</Text>
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="schedule" size={20} color="#666" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoText}>
                  {formatTime(currentEvent.startDate)}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoText}>
                  {currentEvent.location.name}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="attach-money" size={20} color="#666" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Admission</Text>
                <Text style={styles.infoText}>
                  {currentEvent.price || "Free"}
                </Text>
              </View>
            </View>

            {currentEvent.organizer && currentEvent.organizer.name && (
              <View style={styles.infoItem}>
                <MaterialIcons name="business" size={20} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Organizer</Text>
                  <Text style={styles.infoText}>
                    {currentEvent.organizer.name}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{currentEvent.description}</Text>

          {/* Map preview */}
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapPreview}>
            <TouchableOpacity
              style={styles.getDirectionsButton}
              onPress={handleOpenMap}
            >
              <MaterialIcons name="directions" size={20} color="white" />
              <Text style={styles.getDirectionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Organizer contact information */}
          {currentEvent.organizer && currentEvent.organizer.contact && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              {currentEvent.organizer.contact && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() =>
                    Linking.openURL(`tel:${currentEvent.organizer.contact}`)
                  }
                >
                  <MaterialIcons name="phone" size={20} color="#0066cc" />
                  <Text style={styles.contactText}>
                    {currentEvent.organizer.contact}
                  </Text>
                </TouchableOpacity>
              )}

              {currentEvent.organizer.email && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() =>
                    Linking.openURL(`mailto:${currentEvent.organizer.email}`)
                  }
                >
                  <MaterialIcons name="email" size={20} color="#0066cc" />
                  <Text style={styles.contactText}>
                    {currentEvent.organizer.email}
                  </Text>
                </TouchableOpacity>
              )}

              {currentEvent.organizer.website && (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() =>
                    Linking.openURL(currentEvent.organizer.website)
                  }
                >
                  <MaterialIcons name="language" size={20} color="#0066cc" />
                  <Text style={styles.contactText}>
                    {currentEvent.organizer.website}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToItinerary}
        >
          <MaterialIcons name="add-to-photos" size={20} color="white" />
          <Text style={styles.addButtonText}>Add to Itinerary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    position: "absolute",
    top: 50,
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  sliderContainer: {
    height: 250,
    width: width,
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
  statusBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 15,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f2ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
  },
  countdownText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#0066cc",
    fontWeight: "bold",
  },
  infoSection: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 20,
  },
  mapPreview: {
    height: 150,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  getDirectionsButton: {
    flexDirection: "row",
    backgroundColor: "#0066cc",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  getDirectionsText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "500",
  },
  contactSection: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#0066cc",
  },
  footer: {
    backgroundColor: "white",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#0066cc",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default EventDetailsScreen;
