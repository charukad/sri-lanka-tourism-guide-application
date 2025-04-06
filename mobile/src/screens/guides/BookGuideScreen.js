import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchGuideById, bookGuide } from "../../store/slices/guideSlice";

const BookGuideScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { guideId } = route.params;
  const { currentGuide, loading } = useSelector((state) => state.guides);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // Tomorrow
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [requestDetails, setRequestDetails] = useState("");
  const [totalDays, setTotalDays] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  // Fetch guide details when component mounts
  useEffect(() => {
    dispatch(fetchGuideById(guideId));
  }, [dispatch, guideId]);

  // Calculate total days and price when dates change
  useEffect(() => {
    if (currentGuide) {
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(diffDays);
      setTotalPrice(diffDays * currentGuide.pricePerDay);
    }
  }, [startDate, endDate, currentGuide]);

  if (loading || !currentGuide) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading guide details...</Text>
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

  // Handle booking submission
  const handleBookNow = () => {
    if (!requestDetails.trim()) {
      Alert.alert(
        "Error",
        "Please provide some details about your trip and requirements"
      );
      return;
    }

    const bookingData = {
      guideId: currentGuide.id,
      dates: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      requestDetails: requestDetails.trim(),
      totalPrice,
    };

    dispatch(bookGuide(bookingData));

    Alert.alert(
      "Booking Submitted",
      `Your booking request for ${currentGuide.name} has been submitted. You'll be notified when the guide responds to your request.`,
      [
        {
          text: "View My Bookings",
          onPress: () => navigation.navigate("MyBookings"),
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
        <Text style={styles.headerTitle}>Book Guide</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.guideInfo}>
          <Text style={styles.guideName}>{currentGuide.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price per day:</Text>
            <Text style={styles.priceValue}>${currentGuide.pricePerDay}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>

          <View style={styles.datePickerContainer}>
            <Text style={styles.dateLabel}>Start Date</Text>
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
            <Text style={styles.dateLabel}>End Date</Text>
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
          <Text style={styles.sectionTitle}>Trip Details</Text>
          <TextInput
            style={styles.detailsInput}
            placeholder="Describe your trip, interests, and any specific requirements or questions for the guide..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={requestDetails}
            onChangeText={setRequestDetails}
          />
        </View>

        <View style={styles.pricingSummary}>
          <Text style={styles.summaryTitle}>Pricing Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Guide fee (${currentGuide.pricePerDay} × {totalDays}{" "}
              {totalDays === 1 ? "day" : "days"})
            </Text>
            <Text style={styles.summaryValue}>${totalPrice}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service fee</Text>
            <Text style={styles.summaryValue}>$0</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color="#0066cc" />
          <Text style={styles.infoText}>
            This is a booking request. The guide will need to confirm
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
  guideInfo: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  guideName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
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
  detailsInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 120,
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

export default BookGuideScreen;
