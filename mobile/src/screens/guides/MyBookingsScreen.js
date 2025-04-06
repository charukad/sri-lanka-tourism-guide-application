import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { cancelBooking } from "../../store/slices/guideSlice";

const MyBookingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bookings } = useSelector((state) => state.guides);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle booking cancellation
  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          onPress: () => dispatch(cancelBooking(bookingId)),
          style: "destructive",
        },
      ]
    );
  };

  // Get color for the booking status
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      case "completed":
        return "#0066cc";
      case "cancelled":
        return "#FF6B6B";
      default:
        return "#666";
    }
  };

  // Render each booking item
  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.guideInfo}>
          <Image
            source={{ uri: item.guideAvatar }}
            style={styles.guideAvatar}
          />
          <View>
            <Text style={styles.guideName}>{item.guideName}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) },
                ]}
              >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.priceText}>${item.totalPrice}</Text>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>

        <Text style={styles.requestText} numberOfLines={2}>
          {item.requestDetails}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        {item.status === "pending" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelBooking(item.id)}
          >
            <MaterialIcons name="close" size={16} color="#FF6B6B" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate("BookingDetails", { bookingId: item.id })
          }
        >
          <MaterialIcons name="info-outline" size={16} color="#0066cc" />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>

        {(item.status === "confirmed" || item.status === "completed") && (
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="message" size={16} color="#0066cc" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Empty state when no bookings
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="book-online" size={60} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Guide Bookings</Text>
      <Text style={styles.emptyStateText}>
        You haven't booked any guides yet. Explore guides in your destination
        and book one for a more authentic experience.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Guides")}
      >
        <Text style={styles.exploreButtonText}>Explore Guides</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Guide Bookings</Text>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
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
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  guideInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  guideAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  guideName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066cc",
  },
  bookingDetails: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  requestText: {
    fontSize: 14,
    color: "#444",
  },
  actionsContainer: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 10,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#0066cc",
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: "#fff0f0",
  },
  cancelButtonText: {
    color: "#FF6B6B",
    marginLeft: 5,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyBookingsScreen;
