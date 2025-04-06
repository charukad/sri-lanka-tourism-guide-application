import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import {
  addDestinationToDay,
  saveItineraries,
} from "../../store/slices/itinerarySlice";

const AddToItineraryScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { destination } = route.params;
  const { itineraries } = useSelector((state) => state.itinerary);

  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle adding destination to selected day
  const handleAddDestination = () => {
    if (!selectedItinerary || !selectedDay) {
      Alert.alert("Error", "Please select an itinerary and day");
      return;
    }

    dispatch(
      addDestinationToDay({
        itineraryId: selectedItinerary.id,
        dayNumber: selectedDay.dayNumber,
        destination,
      })
    );

    dispatch(saveItineraries(itineraries));

    Alert.alert(
      "Success",
      `${destination.name} has been added to Day ${selectedDay.dayNumber} of ${selectedItinerary.title}`,
      [
        {
          text: "View Itinerary",
          onPress: () =>
            navigation.navigate("ItineraryDetails", {
              itineraryId: selectedItinerary.id,
            }),
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
        <Text style={styles.headerTitle}>Add to Itinerary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Destination preview */}
        <View style={styles.destinationPreview}>
          <Image
            source={{ uri: destination.image }}
            style={styles.destinationImage}
          />
          <View style={styles.destinationDetails}>
            <Text style={styles.destinationName}>{destination.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {destination.category.charAt(0).toUpperCase() +
                  destination.category.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Step 1: Select Itinerary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Step 1: Select Itinerary</Text>

          {itineraries.map((itinerary) => (
            <TouchableOpacity
              key={itinerary.id}
              style={[
                styles.itineraryOption,
                selectedItinerary?.id === itinerary.id && styles.selectedOption,
              ]}
              onPress={() => {
                setSelectedItinerary(itinerary);
                setSelectedDay(null); // Reset day selection
              }}
            >
              <View style={styles.itineraryDetails}>
                <Text style={styles.itineraryTitle}>{itinerary.title}</Text>
                <Text style={styles.itineraryDates}>
                  {formatDate(itinerary.startDate)} -{" "}
                  {formatDate(itinerary.endDate)}
                </Text>
              </View>

              {selectedItinerary?.id === itinerary.id && (
                <MaterialIcons name="check-circle" size={24} color="#0066cc" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 2: Select Day */}
        {selectedItinerary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step 2: Select Day</Text>

            {selectedItinerary.days.map((day) => (
              <TouchableOpacity
                key={day.dayNumber}
                style={[
                  styles.dayOption,
                  selectedDay?.dayNumber === day.dayNumber &&
                    styles.selectedOption,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <View style={styles.dayDetails}>
                  <Text style={styles.dayTitle}>Day {day.dayNumber}</Text>
                  <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                </View>

                <View style={styles.dayPlacesCount}>
                  <Text style={styles.placesCountText}>
                    {day.destinations.length} places
                  </Text>

                  {selectedDay?.dayNumber === day.dayNumber && (
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color="#0066cc"
                      style={{ marginLeft: 10 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addButton,
            (!selectedItinerary || !selectedDay) && styles.disabledButton,
          ]}
          onPress={handleAddDestination}
          disabled={!selectedItinerary || !selectedDay}
        >
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
  content: {
    flex: 1,
    padding: 15,
  },
  destinationPreview: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  destinationImage: {
    width: "100%",
    height: 150,
  },
  destinationDetails: {
    padding: 15,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  itineraryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: "#0066cc",
  },
  itineraryDetails: {
    flex: 1,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  itineraryDates: {
    fontSize: 14,
    color: "#666",
  },
  dayOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dayDetails: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  dayDate: {
    fontSize: 14,
    color: "#666",
  },
  dayPlacesCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  placesCountText: {
    fontSize: 14,
    color: "#666",
  },
  footer: {
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  addButton: {
    backgroundColor: "#0066cc",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddToItineraryScreen;
