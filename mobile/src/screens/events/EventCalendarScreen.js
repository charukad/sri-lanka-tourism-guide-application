import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { fetchEvents, fetchEventsByMonth } from "../../store/slices/eventSlice";

const EventCalendarScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { events, monthlyEvents, loading } = useSelector(
    (state) => state.events
  );

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [markedDates, setMarkedDates] = useState({});
  const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState([]);

  // Fetch all events when component mounts
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Generate marked dates for calendar
  useEffect(() => {
    if (events.length > 0) {
      const marks = {};

      events.forEach((event) => {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        // Loop through each day of the event
        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const dateString = date.toISOString().split("T")[0];

          // Check if this is the start or end date
          const isStart = date.getTime() === startDate.getTime();
          const isEnd = date.getTime() === endDate.getTime();

          if (isStart && isEnd) {
            // Single day event
            marks[dateString] = {
              selected: true,
              selectedColor: getCategoryColor(event.category),
              marked: true,
              dotColor: getCategoryColor(event.category),
            };
          } else if (isStart) {
            // Start date
            marks[dateString] = {
              startingDay: true,
              color: getCategoryColor(event.category),
              textColor: "white",
            };
          } else if (isEnd) {
            // End date
            marks[dateString] = {
              endingDay: true,
              color: getCategoryColor(event.category),
              textColor: "white",
            };
          } else {
            // Middle date
            marks[dateString] = {
              marked: true,
              dotColor: getCategoryColor(event.category),
            };
          }
        }
      });

      // Add selected state to the currently selected date
      if (marks[selectedDate]) {
        marks[selectedDate] = {
          ...marks[selectedDate],
          selected: true,
        };
      } else {
        marks[selectedDate] = {
          selected: true,
          selectedColor: "#0066cc",
        };
      }

      setMarkedDates(marks);

      // Filter events for selected date
      filterEventsForSelectedDate(selectedDate);
    }
  }, [events, selectedDate]);

  // Handle date selection on calendar
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    filterEventsForSelectedDate(day.dateString);
  };

  // Filter events for the selected date
  const filterEventsForSelectedDate = (date) => {
    const filtered = events.filter((event) => {
      const startDate = new Date(event.startDate).toISOString().split("T")[0];
      const endDate = new Date(event.endDate).toISOString().split("T")[0];
      return date >= startDate && date <= endDate;
    });

    setEventsOnSelectedDate(filtered);
  };

  // Handle month change on calendar
  const handleMonthChange = (month) => {
    dispatch(
      fetchEventsByMonth({
        year: month.year,
        month: month.month,
      })
    );
  };

  // Get color for event category
  const getCategoryColor = (category) => {
    switch (category) {
      case "festival":
        return "#FF6B6B"; // Red
      case "religious":
        return "#9C27B0"; // Purple
      case "cultural":
        return "#FF9800"; // Orange
      case "music":
        return "#4CAF50"; // Green
      case "food":
        return "#00BCD4"; // Light Blue
      case "sports":
        return "#3F51B5"; // Indigo
      default:
        return "#0066cc"; // Default Blue
    }
  };

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

  // Render event item
  const renderEventItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.eventItem,
          { borderLeftColor: getCategoryColor(item.category) },
        ]}
        onPress={() =>
          navigation.navigate("EventDetails", { eventId: item._id })
        }
      >
        <View style={styles.eventTime}>
          <MaterialIcons name="event" size={16} color="#666" />
          <Text style={styles.eventTimeText}>
            {new Date(item.startDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.name}</Text>
          <Text style={styles.eventLocation}>{item.location.name}</Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state when no events on selected date
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="event-busy" size={50} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Events</Text>
      <Text style={styles.emptyStateText}>
        There are no events scheduled for this date
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event Calendar</Text>
      </View>

      <Calendar
        style={styles.calendar}
        current={selectedDate}
        onDayPress={handleDateSelect}
        onMonthChange={handleMonthChange}
        markingType="period"
        markedDates={markedDates}
        theme={{
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#b6c1cd",
          selectedDayBackgroundColor: "#0066cc",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#0066cc",
          dayTextColor: "#2d4150",
          textDisabledColor: "#d9e1e8",
          dotColor: "#0066cc",
          selectedDotColor: "#ffffff",
          arrowColor: "#0066cc",
          monthTextColor: "#0066cc",
          indicatorColor: "#0066cc",
          textDayFontWeight: "300",
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "300",
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
      />

      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateText}>{formatDate(selectedDate)}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={eventsOnSelectedDate}
          renderItem={renderEventItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.eventsList}
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
  calendar: {
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedDateContainer: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eeeeee",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  eventsList: {
    padding: 15,
    flexGrow: 1,
  },
  eventItem: {
    flexDirection: "row",
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventTime: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 15,
    minWidth: 50,
  },
  eventTimeText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
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

export default EventCalendarScreen;
