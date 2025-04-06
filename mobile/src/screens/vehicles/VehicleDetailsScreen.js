import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchVehicleById } from "../../store/slices/vehicleSlice";
import { vehicleCategories } from "../../data/vehicles";

const { width } = Dimensions.get("window");

const VehicleDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { vehicleId } = route.params;
  const { currentVehicle, loading } = useSelector((state) => state.vehicles);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef(null);

  // Fetch vehicle details when component mounts
  useEffect(() => {
    dispatch(fetchVehicleById(vehicleId));
  }, [dispatch, vehicleId]);

  if (loading || !currentVehicle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading vehicle details...</Text>
      </View>
    );
  }

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = vehicleCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Vehicle";
  };

  // Render image for the slider
  const renderImageItem = ({ item, index }) => (
    <Image
      source={{ uri: item }}
      style={styles.sliderImage}
      resizeMode="cover"
    />
  );

  // Handle image indicator press
  const handleIndicatorPress = (index) => {
    setActiveImageIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // On scroll end, update active image index
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setActiveImageIndex(index);
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
        <TouchableOpacity style={styles.shareButton} onPress={() => {}}>
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
            data={currentVehicle.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          />

          {/* Image indicators */}
          <View style={styles.indicatorsContainer}>
            {currentVehicle.images.map((_, index) => (
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
        </View>

        {/* Vehicle info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{currentVehicle.title}</Text>
            {currentVehicle.verified && (
              <MaterialIcons name="verified" size={20} color="#0066cc" />
            )}
          </View>

          <View style={styles.categoryRow}>
            <MaterialIcons
              name={
                vehicleCategories.find(
                  (cat) => cat.id === currentVehicle.category
                )?.icon || "directions-car"
              }
              size={18}
              color="#666"
            />
            <Text style={styles.categoryText}>
              {getCategoryName(currentVehicle.category)}
            </Text>
          </View>

          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={18} color="#FFC107" />
            <Text style={styles.ratingText}>
              {currentVehicle.rating} ({currentVehicle.reviewCount} reviews)
            </Text>
          </View>

          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={18} color="#FF6B6B" />
            <Text style={styles.locationText}>{currentVehicle.location}</Text>
          </View>

          <View style={styles.ownerRow}>
            <MaterialIcons name="business" size={18} color="#0066cc" />
            <Text style={styles.ownerText}>
              Provided by {currentVehicle.ownerName}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{currentVehicle.description}</Text>

          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specificationsContainer}>
            <View style={styles.specificationItem}>
              <MaterialIcons name="person" size={24} color="#0066cc" />
              <Text style={styles.specificationValue}>
                {currentVehicle.specifications.passengers}
              </Text>
              <Text style={styles.specificationLabel}>Passengers</Text>
            </View>

            <View style={styles.specificationItem}>
              <MaterialIcons name="work" size={24} color="#0066cc" />
              <Text style={styles.specificationValue}>
                {currentVehicle.specifications.luggage}
              </Text>
              <Text style={styles.specificationLabel}>Luggage</Text>
            </View>

            <View style={styles.specificationItem}>
              <MaterialIcons name="door-front" size={24} color="#0066cc" />
              <Text style={styles.specificationValue}>
                {currentVehicle.specifications.doors}
              </Text>
              <Text style={styles.specificationLabel}>Doors</Text>
            </View>

            <View style={styles.specificationItem}>
              <MaterialIcons
                name={
                  currentVehicle.specifications.transmission === "Automatic"
                    ? "settings"
                    : "settings-applications"
                }
                size={24}
                color="#0066cc"
              />
              <Text style={styles.specificationValue}>
                {currentVehicle.specifications.transmission.substring(0, 4)}
              </Text>
              <Text style={styles.specificationLabel}>Transmission</Text>
            </View>

            <View style={styles.specificationItem}>
              <MaterialIcons
                name={
                  currentVehicle.specifications.airConditioned
                    ? "ac-unit"
                    : "air"
                }
                size={24}
                color="#0066cc"
              />
              <Text style={styles.specificationValue}>
                {currentVehicle.specifications.airConditioned ? "Yes" : "No"}
              </Text>
              <Text style={styles.specificationLabel}>A/C</Text>
            </View>

            <View style={styles.specificationItem}>
              <MaterialIcons
                name="local-gas-station"
                size={24}
                color="#0066cc"
              />
              <Text style={styles.specificationValue}>
                {currentVehicle.specifications.fuelType}
              </Text>
              <Text style={styles.specificationLabel}>Fuel Type</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresContainer}>
            {currentVehicle.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {currentVehicle.availableForDelivery && (
            <View style={styles.deliveryContainer}>
              <MaterialIcons name="local-shipping" size={20} color="#0066cc" />
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryTitle}>
                  Vehicle Delivery Available
                </Text>
                <Text style={styles.deliveryText}>
                  This vehicle can be delivered to your location
                  {currentVehicle.deliveryFee > 0
                    ? ` for an additional $${currentVehicle.deliveryFee}.`
                    : " at no extra cost."}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom booking bar */}
      <View style={styles.bookingBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>${currentVehicle.pricePerDay}</Text>
          <Text style={styles.priceLabel}>/day</Text>
        </View>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate("BookVehicle", { vehicleId: currentVehicle.id })
          }
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
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
  infoContainer: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  categoryText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  ratingText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  locationText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  ownerText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  specificationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  specificationItem: {
    width: "30%",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  specificationValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  specificationLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  featuresContainer: {
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#444",
  },
  deliveryContainer: {
    flexDirection: "row",
    backgroundColor: "#e6f2ff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  deliveryInfo: {
    marginLeft: 10,
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  deliveryText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  bookingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    padding: 15,
    backgroundColor: "white",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
    marginLeft: 3,
  },
  bookButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VehicleDetailsScreen;
