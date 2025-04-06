import React, { useState, useEffect } from "react";
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
  setCurrentItinerary,
  removeDestinationFromDay,
  saveItineraries,
} from "../../store/slices/itinerarySlice";

const ItineraryDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { itineraryId } = route.params;
  const { itineraries } = useSelector((state) => state.itinerary);

  const [itinerary, setItinerary] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    const foundItinerary = itineraries.find((item) => item.id === itineraryId);
    if (foundItinerary) {
      setItinerary(foundItinerary);
      dispatch(setCurrentItinerary(itineraryId));
    } else {
      Alert.alert("Error", "Itinerary not found");
      navigation.goBack();
    }
  }, [itineraryId, itineraries, dispatch, navigation]);

  useEffect(() => {
    if (itineraries.length > 0) {
      dispatch(saveItineraries(itineraries));
    }
  }, [itineraries, dispatch]);

  if (!itinerary) {
    return null;
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get the selected day object
  const currentDay = itinerary.days.find(
    (day) => day.dayNumber === selectedDay
  );

  // Remove a destination from itinerary
  const handleRemoveDestination = (destinationId) => {
    Alert.alert(
      "Remove Destination",
      "Are you sure you want to remove this destination from your itinerary?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: () => {
            dispatch(
              removeDestinationFromDay({
                itineraryId: itinerary.id,
                dayNumber: selectedDay,
                destinationId,
              })
            );
          },
          style: "destructive",
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
        <Text style={styles.headerTitle}>{itinerary.title}</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() =>
            Alert.alert(
              "Coming Soon",
              "Sharing functionality will be available soon!"
            )
          }
        >
          <MaterialIcons name="share" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Days selector tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {itinerary.days.map((day) => (
            <TouchableOpacity
              key={day.dayNumber}
              style={[
                styles.tab,
                day.dayNumber === selectedDay && styles.activeTab,
              ]}
              onPress={() => setSelectedDay(day.dayNumber)}
            >
              <Text
                style={[
                  styles.tabDay,
                  day.dayNumber === selectedDay && styles.activeTabText,
                ]}
              >
                Day {day.dayNumber}
              </Text>
              <Text
                style={[
                  styles.tabDate,
                  day.dayNumber === selectedDay && styles.activeTabText,
                ]}
              >
                {formatDate(day.date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Day content */}
      <View style={styles.dayContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            Day {currentDay.dayNumber} • {formatDate(currentDay.date)}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate("ExploreForItinerary", {
                itineraryId: itinerary.id,
                dayNumber: selectedDay,
              })
            }
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Place</Text>
          </TouchableOpacity>
        </View>

        {currentDay.destinations.length === 0 ? (
          <View style={styles.emptyDay}>
            <MaterialIcons name="place" size={50} color="#ccc" />
            <Text style={styles.emptyDayText}>
              No destinations planned for this day
            </Text>
            <TouchableOpacity
              style={styles.explorePlacesButton}
              onPress={() =>
                navigation.navigate("ExploreForItinerary", {
                  itineraryId: itinerary.id,
                  dayNumber: selectedDay,
                })
              }
            >
              <Text style={styles.explorePlacesText}>Explore Places</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.destinationsList}>
            {currentDay.destinations.map((destination, index) => (
              <View key={destination.id} style={styles.destinationItem}>
                <View style={styles.destinationNumber}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>

                <View style={styles.destinationLine} />

                <View style={styles.destinationCard}>
                  <Image
                    source={{ uri: destination.image }}
                    style={styles.destinationImage}
                  />

                  <View style={styles.destinationInfo}>
                    <Text style={styles.destinationName}>
                      {destination.name}
                    </Text>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          navigation.navigate("DestinationDetails", {
                            destination: { id: destination.id },
                          })
                        }
                      >
                        <MaterialIcons
                          name="info-outline"
                          size={18}
                          color="#0066cc"
                        />
                        <Text style={styles.actionButtonText}>Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.removeButton]}
                        onPress={() => handleRemoveDestination(destination.id)}
                      >
                        <MaterialIcons name="close" size={18} color="#ff6b6b" />
                        <Text
                          style={[
                            styles.actionButtonText,
                            styles.removeButtonText,
                          ]}
                        >
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
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
    flex: 1,
    textAlign: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  tabs: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    minWidth: 100,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#0066cc",
  },
  tabDay: {
    fontWeight: "bold",
    color: "#333",
  },
  tabDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activeTabText: {
    color: "white",
  },
  dayContainer: {
    flex: 1,
    padding: 15,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0066cc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
  },
  emptyDay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyDayText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    marginBottom: 20,
  },
  explorePlacesButton: {
    backgroundColor: "#0066cc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  explorePlacesText: {
    color: "white",
    fontWeight: "bold",
  },
  destinationsList: {
    flex: 1,
  },
  destinationItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  destinationNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  numberText: {
    color: "white",
    fontWeight: "bold",
  },
  destinationLine: {
    width: 2,
    backgroundColor: "#ddd",
    position: "absolute",
    left: 15,
    top: 30,
    bottom: 0,
    zIndex: -1,
  },
  destinationCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  destinationImage: {
    width: "100%",
    height: 120,
  },
  destinationInfo: {
    padding: 10,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  actionButtonText: {
    marginLeft: 5,
    color: "#0066cc",
  },
  removeButton: {
    backgroundColor: "#fff0f0",
  },
  removeButtonText: {
    color: "#ff6b6b",
  },
});

export default ItineraryDetailsScreen;
