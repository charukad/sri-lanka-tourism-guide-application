import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchVehicles, filterVehicles } from "../../store/slices/vehicleSlice";
import { vehicleCategories, locations } from "../../data/vehicles";

const VehiclesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { filteredVehicles, loading } = useSelector((state) => state.vehicles);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Fetch vehicles when component mounts
  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  // Apply filters when filter options change
  useEffect(() => {
    dispatch(
      filterVehicles({
        category: selectedCategory,
        location: selectedLocation,
        passengers: 0, // No minimum passenger filter by default
      })
    );
  }, [selectedCategory, selectedLocation, dispatch]);

  // Get icon for vehicle category
  const getCategoryIcon = (category) => {
    const categoryData = vehicleCategories.find((cat) => cat.id === category);
    return categoryData ? categoryData.icon : "directions-car";
  };

  // Render vehicle card
  const renderVehicleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() =>
        navigation.navigate("VehicleDetails", { vehicleId: item.id })
      }
    >
      <Image source={{ uri: item.images[0] }} style={styles.vehicleImage} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.vehicleTitle}>{item.title}</Text>
          {item.verified && (
            <MaterialIcons name="verified" size={16} color="#0066cc" />
          )}
        </View>

        <View style={styles.categoryContainer}>
          <MaterialIcons
            name={getCategoryIcon(item.category)}
            size={16}
            color="#666"
          />
          <Text style={styles.categoryText}>
            {vehicleCategories.find((c) => c.id === item.category)?.name ||
              "Vehicle"}
          </Text>
        </View>

        <View style={styles.specRow}>
          <View style={styles.specItem}>
            <MaterialIcons name="person" size={16} color="#666" />
            <Text style={styles.specText}>
              {item.specifications.passengers} people
            </Text>
          </View>

          <View style={styles.specItem}>
            <MaterialIcons name="work" size={16} color="#666" />
            <Text style={styles.specText}>
              {item.specifications.luggage} luggage
            </Text>
          </View>

          <View style={styles.specItem}>
            <MaterialIcons
              name={
                item.specifications.transmission === "Automatic"
                  ? "settings"
                  : "settings-applications"
              }
              size={16}
              color="#666"
            />
            <Text style={styles.specText}>
              {item.specifications.transmission}
            </Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={16} color="#FF6B6B" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>
              {item.rating} ({item.reviewCount})
            </Text>
          </View>

          <Text style={styles.priceText}>${item.pricePerDay}/day</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty state when no vehicles match filters
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="directions-car" size={60} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No vehicles found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your filters to find available vehicles
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rent a Vehicle</Text>
      </View>

      {/* Category filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Vehicle Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterOptions}
        >
          {vehicleCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterOption,
                selectedCategory === category.id && styles.selectedFilter,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialIcons
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? "white" : "#666"}
                style={styles.filterIcon}
              />
              <Text
                style={[
                  styles.filterOptionText,
                  selectedCategory === category.id && styles.selectedFilterText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Location filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Location</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterOptions}
        >
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedLocation === "all" && styles.selectedFilter,
            ]}
            onPress={() => setSelectedLocation("all")}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedLocation === "all" && styles.selectedFilterText,
              ]}
            >
              All Locations
            </Text>
          </TouchableOpacity>

          {locations.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.filterOption,
                selectedLocation === location && styles.selectedFilter,
              ]}
              onPress={() => setSelectedLocation(location)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedLocation === location && styles.selectedFilterText,
                ]}
              >
                {location}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Vehicle list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.vehicleList}
          ListEmptyComponent={renderEmptyState}
        />
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  filterContainer: {
    backgroundColor: "white",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    marginBottom: 5,
  },
  filterOptions: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
  selectedFilter: {
    backgroundColor: "#0066cc",
    borderColor: "#0066cc",
  },
  filterIcon: {
    marginRight: 5,
  },
  filterOptionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedFilterText: {
    color: "white",
    fontWeight: "bold",
  },
  vehicleList: {
    padding: 10,
    paddingBottom: 20,
  },
  vehicleCard: {
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
    height: 180,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  specRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  specText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066cc",
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
  },
});

export default VehiclesScreen;
