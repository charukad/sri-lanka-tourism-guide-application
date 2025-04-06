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
import { cancelBooking } from "../../store/slices/vehicleSlice";

const MyVehicleBookingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { bookings } = useSelector((state) => state.vehicles);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle booking cancellation
  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this vehicle booking?",
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
      <Image source={{ uri: item.vehicleImage }} style={styles.vehicleImage} />

      <View style={styles.bookingDetails}>
        <View style={styles.bookingHeader}>
          <Text style={styles.vehicleTitle}>{item.vehicleTitle}</Text>
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

        <Text style={styles.ownerText}>by {item.ownerName}</Text>

        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.detailText}>Pickup: {item.pickupLocation}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="location-off" size={16} color="#666" />
          <Text style={styles.detailText}>Return: {item.returnLocation}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons
            name={
              item.driverOption === "with-driver" ? "person" : "directions-car"
            }
            size={16}
            color="#666"
          />
          <Text style={styles.detailText}>
            {item.driverOption === "with-driver" ? "With driver" : "Self-drive"}
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total:</Text>
          <Text style={styles.priceValue}>${item.totalPrice.toFixed(2)}</Text>
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
              navigation.navigate("VehicleBookingDetails", {
                bookingId: item.id,
              })
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
    </View>
  );

  // Empty state when no bookings
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="directions-car" size={60} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Vehicle Bookings</Text>
      <Text style={styles.emptyStateText}>
        You haven't booked any vehicles yet. Explore our vehicle options to find
        the perfect transportation for your Sri Lanka journey.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Vehicles")}
      >
        <Text style={styles.exploreButtonText}>Explore Vehicles</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vehicle Bookings</Text>
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
  vehicleImage: {
    width: "100%",
    height: 150,
  },
  bookingDetails: {
    padding: 15,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  ownerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
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
  priceRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    marginRight: 5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066cc",
  },
  actionsContainer: {
    flexDirection: "row",
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

export default MyVehicleBookingsScreen;
