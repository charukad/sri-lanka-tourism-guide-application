import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchEvents, filterEvents } from "../../store/slices/eventSlice";

const EventsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { events, filteredEvents, loading } = useSelector(
    (state) => state.events
  );

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  // Event categories
  const categories = [
    { id: "all", name: "All Events", icon: "event" },
    { id: "festival", name: "Festivals", icon: "celebration" },
    { id: "religious", name: "Religious", icon: "church" },
    { id: "cultural", name: "Cultural", icon: "theater-comedy" },
    { id: "music", name: "Music", icon: "music-note" },
    { id: "food", name: "Food", icon: "restaurant" },
    { id: "sports", name: "Sports", icon: "sports" },
    { id: "other", name: "Other", icon: "more-horiz" },
  ];

  // Fetch events when component mounts
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // Apply filters when filter options change
  useEffect(() => {
    dispatch(
      filterEvents({
        category: selectedCategory,
        date: selectedDate,
      })
    );
  }, [selectedCategory, selectedDate, dispatch]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate if an event is upcoming or ongoing
  const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { label: "Upcoming", color: "#0066cc" };
    } else if (now >= start && now <= end) {
      return { label: "Ongoing", color: "#4CAF50" };
    } else {
      return { label: "Past", color: "#757575" };
    }
  };

  // Render event item
  const renderEventItem = ({ item }) => {
    const eventStatus = getEventStatus(item.startDate, item.endDate);

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() =>
          navigation.navigate("EventDetails", { eventId: item._id })
        }
      >
        <Image
          source={{
            uri: item.images[0] || "https://via.placeholder.com/300x150",
          }}
          style={styles.eventImage}
        />

        <View style={styles.eventContent}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: eventStatus.color + "20" },
            ]}
          >
            <Text style={[styles.statusText, { color: eventStatus.color }]}>
              {eventStatus.label}
            </Text>
          </View>

          <Text style={styles.eventTitle}>{item.name}</Text>

          <View style={styles.eventMeta}>
            <View style={styles.eventMetaItem}>
              <MaterialIcons name="event" size={16} color="#666" />
              <Text style={styles.eventMetaText}>
                {formatDate(item.startDate)}
                {item.startDate !== item.endDate &&
                  ` - ${formatDate(item.endDate)}`}
              </Text>
            </View>

            <View style={styles.eventMetaItem}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.eventMetaText}>{item.location.name}</Text>
            </View>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state when no events match filters
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="event-busy" size={60} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No events found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your filters to find cultural events and festivals
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events & Festivals</Text>
      </View>

      {/* Category filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterOptions}
        >
          {categories.map((category) => (
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

      {/* Date filter buttons */}
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity
          style={[
            styles.dateFilterButton,
            !selectedDate && styles.selectedDateFilter,
          ]}
          onPress={() => setSelectedDate(null)}
        >
          <Text
            style={[
              styles.dateFilterText,
              !selectedDate && styles.selectedDateFilterText,
            ]}
          >
            All Dates
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dateFilterButton,
            selectedDate === "upcoming" && styles.selectedDateFilter,
          ]}
          onPress={() => setSelectedDate("upcoming")}
        >
          <Text
            style={[
              styles.dateFilterText,
              selectedDate === "upcoming" && styles.selectedDateFilterText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dateFilterButton,
            selectedDate === "today" && styles.selectedDateFilter,
          ]}
          onPress={() => setSelectedDate("today")}
        >
          <Text
            style={[
              styles.dateFilterText,
              selectedDate === "today" && styles.selectedDateFilterText,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dateFilterButton,
            selectedDate === "this-week" && styles.selectedDateFilter,
          ]}
          onPress={() => setSelectedDate("this-week")}
        >
          <Text
            style={[
              styles.dateFilterText,
              selectedDate === "this-week" && styles.selectedDateFilterText,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
      </View>

      {/* Event list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.eventList}
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  filterOptions: {
    paddingHorizontal: 10,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 6,
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
  dateFilterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  dateFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
  },
  selectedDateFilter: {
    backgroundColor: "#0066cc",
  },
  dateFilterText: {
    fontSize: 12,
    color: "#666",
  },
  selectedDateFilterText: {
    color: "white",
    fontWeight: "bold",
  },
  eventList: {
    padding: 15,
    paddingBottom: 20,
  },
  eventCard: {
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
  eventImage: {
    width: "100%",
    height: 150,
  },
  eventContent: {
    padding: 15,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  eventMeta: {
    marginBottom: 10,
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  eventMetaText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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

export default EventsScreen;
