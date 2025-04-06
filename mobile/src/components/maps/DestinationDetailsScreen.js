import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const DestinationDetailsScreen = ({ route, navigation }) => {
  // Get the destination from navigation params
  const { destination } = route.params;

  const getCategoryColor = (category) => {
    switch (category) {
      case "historical":
        return "#FF6B6B"; // Red
      case "nature":
        return "#4CAF50"; // Green
      case "beach":
        return "#00BCD4"; // Light Blue
      case "religious":
        return "#9C27B0"; // Purple
      case "scenic":
        return "#FF9800"; // Orange
      default:
        return "#0066CC"; // Default Blue
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case "historical":
        return "Historical Site";
      case "nature":
        return "Nature & Wildlife";
      case "beach":
        return "Beach";
      case "religious":
        return "Religious Site";
      case "scenic":
        return "Scenic View";
      default:
        return "Destination";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: destination.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.detailsContainer}>
        {/* Title & Rating */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>{destination.name}</Text>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={18} color="#FFC107" />
            <Text style={styles.rating}>{destination.rating}</Text>
          </View>
        </View>

        {/* Category */}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(destination.category) },
          ]}
        >
          <Text style={styles.categoryText}>
            {getCategoryName(destination.category)}
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{destination.description}</Text>

        {/* Information Sections */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          <Text style={styles.sectionContent}>{destination.openingHours}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Entrance Fee</Text>
          <Text style={styles.sectionContent}>{destination.entranceFee}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Best Time to Visit</Text>
          <Text style={styles.sectionContent}>
            {destination.bestTimeToVisit}
          </Text>
        </View>

        {/* Activities */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <View style={styles.activitiesContainer}>
            {destination.activities.map((activity, index) => (
              <View key={index} style={styles.activityBadge}>
                <Text style={styles.activityText}>{activity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="add-to-photos" size={20} color="white" />
            <Text style={styles.actionButtonText}>Add to Itinerary</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
          >
            <MaterialIcons name="share" size={20} color="white" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding for scroll */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  imageContainer: {
    height: 250,
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 15,
  },
  categoryText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  sectionContent: {
    fontSize: 16,
    color: "#555",
  },
  activitiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  activityBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  activityText: {
    color: "#555",
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#0066CC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  secondaryButton: {
    backgroundColor: "#FF6B6B",
    marginRight: 0,
    marginLeft: 10,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default DestinationDetailsScreen;
