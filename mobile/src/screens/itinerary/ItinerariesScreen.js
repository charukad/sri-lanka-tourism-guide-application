import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import {
  loadItineraries,
  saveItineraries,
  deleteItinerary,
} from "../../store/slices/itinerarySlice";

const ItinerariesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { itineraries, loading } = useSelector((state) => state.itinerary);

  // Load itineraries on initial render
  useEffect(() => {
    dispatch(loadItineraries());
  }, [dispatch]);

  // Save itineraries when the list changes
  useEffect(() => {
    if (itineraries.length > 0) {
      dispatch(saveItineraries(itineraries));
    }
  }, [itineraries, dispatch]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate trip duration
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  // Count total destinations in an itinerary
  const countDestinations = (itinerary) => {
    return itinerary.days.reduce(
      (total, day) => total + day.destinations.length,
      0
    );
  };

  // Handle itinerary deletion
  const handleDelete = (id, title) => {
    Alert.alert(
      "Delete Itinerary",
      `Are you sure you want to delete "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => dispatch(deleteItinerary(id)),
          style: "destructive",
        },
      ]
    );
  };

  // Render each itinerary item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itineraryCard}
      onPress={() =>
        navigation.navigate("ItineraryDetails", { itineraryId: item.id })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.itineraryTitle}>{item.title}</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditItinerary", { itinerary: item })
            }
            style={styles.editButton}
          >
            <MaterialIcons name="edit" size={20} color="#0066cc" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateContainer}>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <Text style={styles.dateText}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.infoText}>
              {calculateDuration(item.startDate, item.endDate)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <MaterialIcons name="place" size={16} color="#666" />
            <Text style={styles.infoText}>
              {countDestinations(item)}{" "}
              {countDestinations(item) === 1 ? "destination" : "destinations"}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id, item.title)}
      >
        <MaterialIcons name="delete-outline" size={22} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render empty state if no itineraries
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="map" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Itineraries Yet</Text>
      <Text style={styles.emptyText}>
        Start planning your Sri Lanka adventure by creating your first
        itinerary.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateItinerary")}
      >
        <Text style={styles.createButtonText}>Create Itinerary</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && itineraries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Itineraries</Text>
      </View>

      <FlatList
        data={itineraries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
      />

      {itineraries.length > 0 && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => navigation.navigate("CreateItinerary")}
        >
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  itineraryCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  editButton: {
    padding: 5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  deleteButton: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderLeftWidth: 1,
    borderLeftColor: "#eeeeee",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  fabButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#0066cc",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ItinerariesScreen;
