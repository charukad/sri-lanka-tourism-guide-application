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
import { fetchGuides, filterGuides } from "../../store/slices/guideSlice";
import { expertiseCategories, areas } from "../../data/guides";

const GuidesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { filteredGuides, loading } = useSelector((state) => state.guides);

  const [selectedExpertise, setSelectedExpertise] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");

  // Fetch guides when component mounts
  useEffect(() => {
    dispatch(fetchGuides());
  }, [dispatch]);

  // Apply filters when filter options change
  useEffect(() => {
    dispatch(
      filterGuides({
        expertise: selectedExpertise,
        area: selectedArea,
        language: "all",
      })
    );
  }, [selectedExpertise, selectedArea, dispatch]);

  // Render guide card
  const renderGuideItem = ({ item }) => (
    <TouchableOpacity
      style={styles.guideCard}
      onPress={() => navigation.navigate("GuideDetails", { guideId: item.id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.guideAvatar} />

      <View style={styles.guideInfo}>
        <View style={styles.guideHeader}>
          <Text style={styles.guideName}>{item.name}</Text>
          {item.verified && (
            <MaterialIcons name="verified" size={16} color="#0066cc" />
          )}
        </View>

        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#FFC107" />
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviewCount})
          </Text>
        </View>

        <Text style={styles.guideExpertise}>{item.expertise.join(" • ")}</Text>

        <View style={styles.guideFooter}>
          <Text style={styles.priceText}>${item.pricePerDay} / day</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Empty state when no guides match filters
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="person-search" size={60} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No guides found</Text>
      <Text style={styles.emptyStateText}>
        Try adjusting your filters to find available guides
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Local Guides</Text>
      </View>

      {/* Expertise filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Expertise</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterOptions}
        >
          {expertiseCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterOption,
                selectedExpertise === category.id && styles.selectedFilter,
              ]}
              onPress={() => setSelectedExpertise(category.id)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedExpertise === category.id &&
                    styles.selectedFilterText,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Area filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Area</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterOptions}
        >
          <TouchableOpacity
            style={[
              styles.filterOption,
              selectedArea === "all" && styles.selectedFilter,
            ]}
            onPress={() => setSelectedArea("all")}
          >
            <Text
              style={[
                styles.filterOptionText,
                selectedArea === "all" && styles.selectedFilterText,
              ]}
            >
              All Areas
            </Text>
          </TouchableOpacity>

          {areas.map((area) => (
            <TouchableOpacity
              key={area}
              style={[
                styles.filterOption,
                selectedArea === area && styles.selectedFilter,
              ]}
              onPress={() => setSelectedArea(area)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  selectedArea === area && styles.selectedFilterText,
                ]}
              >
                {area}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Guide list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading guides...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredGuides}
          renderItem={renderGuideItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.guideList}
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
  filterOptionText: {
    fontSize: 14,
    color: "#333",
  },
  selectedFilterText: {
    color: "white",
    fontWeight: "bold",
  },
  guideList: {
    padding: 10,
    paddingBottom: 20,
  },
  guideCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  guideInfo: {
    flex: 1,
  },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  guideName: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#666",
  },
  guideExpertise: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  guideFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0066cc",
  },
  viewButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewButtonText: {
    fontSize: 14,
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

export default GuidesScreen;
