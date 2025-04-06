import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchVehicleById, bookVehicle } from "../../store/slices/vehicleSlice";
import { locations } from "../../data/vehicles";

const BookVehicleScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { vehicleId } = route.params;
  const { currentVehicle, loading } = useSelector((state) => state.vehicles);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [includeDriver, setIncludeDriver] = useState(false);
  const [pickupLocation, setPickupLocation] = useState("");
  const [returnLocation, setReturnLocation] = useState("");
  const [showPickupLocations, setShowPickupLocations] = useState(false);
  const [showReturnLocations, setShowReturnLocations] = useState(false);
  const [totalDays, setTotalDays] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch vehicle details when component mounts
  useEffect(() => {
    dispatch(fetchVehicleById(vehicleId));
  }, [dispatch, vehicleId]);

  // Set default pickup location when vehicle data loads
  useEffect(() => {
    if (currentVehicle) {
      setPickupLocation(currentVehicle.location);
      setReturnLocation(currentVehicle.location);
    }
  }, [currentVehicle]);

  // Calculate total days and price when dates or driver option changes
  useEffect(() => {
    if (currentVehicle) {
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(diffDays);

      // Calculate base price (vehicle price * days)
      let price = diffDays * currentVehicle.pricePerDay;

      // Add driver fee if selected (50% more)
      if (includeDriver) {
        price += price * 0.5;
      }

      // Add delivery fee if needed
      if (
        currentVehicle.availableForDelivery &&
        pickupLocation !== currentVehicle.location
      ) {
        price += currentVehicle.deliveryFee;
      }

      setTotalPrice(price);
    }
  }, [startDate, endDate, currentVehicle, includeDriver, pickupLocation]);

  if (loading || !currentVehicle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading vehicle details...</Text>
      </View>
    );
  }

  // Format date for display
  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  // Handle date picker changes
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === "ios");
    setStartDate(currentDate);

    // If end date is before start date, update it
    if (endDate < currentDate) {
      setEndDate(currentDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === "ios");
    setEndDate(currentDate);
  };

  // Filter locations based on input
  const filteredPickupLocations = pickupLocation
    ? locations.filter((loc) =>
        loc.toLowerCase().includes(pickupLocation.toLowerCase())
      )
    : locations;

  const filteredReturnLocations = returnLocation
    ? locations.filter((loc) =>
        loc.toLowerCase().includes(returnLocation.toLowerCase())
      )
    : locations;

  // Handle booking submission
  const handleBookNow = () => {
    if (!pickupLocation) {
      Alert.alert("Error", "Please select a pickup location");
      return;
    }

    if (!returnLocation) {
      Alert.alert("Error", "Please select a return location");
      return;
    }

    const bookingData = {
      vehicleId: currentVehicle.id,
      dates: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      pickupLocation,
      returnLocation,
      driverOption: includeDriver ? "with-driver" : "self-drive",
      totalPrice,
    };

    dispatch(bookVehicle(bookingData));

    Alert.alert(
      "Booking Submitted",
      `Your booking request for ${currentVehicle.title} has been submitted. You'll be notified when the owner responds to your request.`,
      [
        {
          text: "View My Bookings",
          onPress: () => navigation.navigate("MyVehicleBookings"),
        },
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Vehicle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle}>{currentVehicle.title}</Text>
          <Text style={styles.vehicleOwner}>by {currentVehicle.ownerName}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price per day:</Text>
            <Text style={styles.priceValue}>${currentVehicle.pricePerDay}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>

          <View style={styles.datePickerContainer}>
            <Text style={styles.dateLabel}>Pickup Date</Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#0066cc" />
            </TouchableOpacity>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.datePickerContainer}>
            <Text style={styles.dateLabel}>Return Date</Text>
            <TouchableOpacity
              style={styles.datePicker}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#0066cc" />
            </TouchableOpacity>

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Pickup Location</Text>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => setShowPickupLocations(true)}
            >
              <TextInput
                value={pickupLocation}
                onChangeText={setPickupLocation}
                placeholder="Select pickup location"
                style={styles.locationInputText}
                onFocus={() => setShowPickupLocations(true)}
              />
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>

            {showPickupLocations && (
              <View style={styles.dropdownContainer}>
                <ScrollView style={styles.dropdown} nestedScrollEnabled={true}>
                  {filteredPickupLocations.map((location) => (
                    <TouchableOpacity
                      key={location}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPickupLocation(location);
                        setShowPickupLocations(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{location}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.locationContainer}>
            <Text style={styles.locationLabel}>Return Location</Text>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => setShowReturnLocations(true)}
            >
              <TextInput
                value={returnLocation}
                onChangeText={setReturnLocation}
                placeholder="Select return location"
                style={styles.locationInputText}
                onFocus={() => setShowReturnLocations(true)}
              />
              <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>

            {showReturnLocations && (
              <View style={styles.dropdownContainer}>
                <ScrollView style={styles.dropdown} nestedScrollEnabled={true}>
                  {filteredReturnLocations.map((location) => (
                    <TouchableOpacity
                      key={location}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setReturnLocation(location);
                        setShowReturnLocations(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{location}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {currentVehicle.availableForDelivery &&
            pickupLocation !== currentVehicle.location && (
              <View style={styles.deliveryFeeContainer}>
                <MaterialIcons name="local-shipping" size={18} color="#666" />
                <Text style={styles.deliveryFeeText}>
                  Delivery fee: ${currentVehicle.deliveryFee}
                </Text>
              </View>
            )}
        </View>

        <View style={styles.section}>
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Include Driver</Text>
              <Text style={styles.optionDescription}>
                We can provide a professional driver for an additional fee (50%
                of the rental price)
              </Text>
            </View>
            <Switch
              value={includeDriver}
              onValueChange={setIncludeDriver}
              trackColor={{ false: "#d9d9d9", true: "#b3d9ff" }}
              thumbColor={includeDriver ? "#0066cc" : "#f4f3f4"}
              ios_backgroundColor="#d9d9d9"
            />
          </View>
        </View>

        <View style={styles.pricingSummary}>
          <Text style={styles.summaryTitle}>Pricing Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Vehicle rental (${currentVehicle.pricePerDay} × {totalDays}{" "}
              {totalDays === 1 ? "day" : "days"})
            </Text>
            <Text style={styles.summaryValue}>
              ${currentVehicle.pricePerDay * totalDays}
            </Text>
          </View>

          {includeDriver && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Driver fee (50%)</Text>
              <Text style={styles.summaryValue}>
                ${(currentVehicle.pricePerDay * totalDays * 0.5).toFixed(2)}
              </Text>
            </View>
          )}

          {currentVehicle.availableForDelivery &&
            pickupLocation !== currentVehicle.location && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery fee</Text>
                <Text style={styles.summaryValue}>
                  ${currentVehicle.deliveryFee}
                </Text>
              </View>
            )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service fee</Text>
            <Text style={styles.summaryValue}>$0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color="#0066cc" />
          <Text style={styles.infoText}>
            This is a booking request. The vehicle owner will need to confirm
            availability before your booking is finalized.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
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
  scrollView: {
    flex: 1,
  },
  vehicleInfo: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  vehicleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  vehicleOwner: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066cc",
    marginLeft: 5,
  },
  section: {
    backgroundColor: "white",
    padding: 20,
    marginTop: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eeeeee",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  datePickerContainer: {
    marginBottom: 15,
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
  },
  dateText: {
    fontSize: 16,
  },
  locationContainer: {
    marginBottom: 15,
    zIndex: 10,
  },
  locationLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  locationInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "white",
  },
  locationInputText: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdown: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
  },
  deliveryFeeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  deliveryFeeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionInfo: {
    flex: 1,
    marginRight: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  pricingSummary: {
    backgroundColor: "white",
    padding: 20,
    marginTop: 15,
    marginBottom: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eeeeee",
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#eeeeee",
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066cc",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#e6f2ff",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#0066cc",
  },
  footer: {
    backgroundColor: "white",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  bookButton: {
    backgroundColor: "#0066cc",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BookVehicleScreen;
