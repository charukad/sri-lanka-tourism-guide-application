import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchGuideById } from "../../store/slices/guideSlice";

const { width } = Dimensions.get("window");
const imageWidth = width - 40; // Full width minus padding

const GuideDetailsScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { guideId } = route.params;
  const { currentGuide, loading } = useSelector((state) => state.guides);

  const [activeTab, setActiveTab] = useState("about");

  // Fetch guide details when component mounts
  useEffect(() => {
    dispatch(fetchGuideById(guideId));
  }, [dispatch, guideId]);

  if (loading || !currentGuide) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading guide details...</Text>
      </View>
    );
  }

  // Render guide's gallery images
  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity style={styles.galleryItem}>
      <Image
        source={{ uri: item }}
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  // Render availability schedule
  const renderAvailability = () => {
    const days = [
      { key: "monday", label: "Monday" },
      { key: "tuesday", label: "Tuesday" },
      { key: "wednesday", label: "Wednesday" },
      { key: "thursday", label: "Thursday" },
      { key: "friday", label: "Friday" },
      { key: "saturday", label: "Saturday" },
      { key: "sunday", label: "Sunday" },
    ];

    return (
      <View style={styles.availabilityContainer}>
        {days.map((day) => (
          <View key={day.key} style={styles.availabilityRow}>
            <Text style={styles.dayText}>{day.label}</Text>
            {currentGuide.availability[day.key] ? (
              <View style={styles.availableIndicator}>
                <MaterialIcons name="check" size={16} color="white" />
                <Text style={styles.availableText}>Available</Text>
              </View>
            ) : (
              <View style={styles.unavailableIndicator}>
                <MaterialIcons name="close" size={16} color="white" />
                <Text style={styles.unavailableText}>Unavailable</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
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

      <ScrollView style={styles.scrollView}>
        {/* Profile section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: currentGuide.avatar }} style={styles.avatar} />

          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{currentGuide.name}</Text>
              {currentGuide.verified && (
                <MaterialIcons name="verified" size={20} color="#0066cc" />
              )}
            </View>

            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={18} color="#FFC107" />
              <Text style={styles.rating}>
                {currentGuide.rating} ({currentGuide.reviewCount} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="history" size={16} color="#666" />
              <Text style={styles.infoText}>
                {currentGuide.experience} years
              </Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="attach-money" size={16} color="#666" />
              <Text style={styles.infoText}>
                ${currentGuide.pricePerDay}/day
              </Text>
            </View>
          </View>
        </View>

        {/* Tabs navigation */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "about" && styles.activeTab]}
            onPress={() => setActiveTab("about")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "about" && styles.activeTabText,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "gallery" && styles.activeTab]}
            onPress={() => setActiveTab("gallery")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "gallery" && styles.activeTabText,
              ]}
            >
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "availability" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("availability")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "availability" && styles.activeTabText,
              ]}
            >
              Availability
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === "about" && (
            <View>
              <Text style={styles.sectionTitle}>Bio</Text>
              <Text style={styles.bioText}>{currentGuide.bio}</Text>

              <Text style={styles.sectionTitle}>Expertise</Text>
              <View style={styles.expertiseContainer}>
                {currentGuide.expertise.map((item) => (
                  <View key={item} style={styles.expertiseItem}>
                    <Text style={styles.expertiseText}>{item}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.languagesContainer}>
                {currentGuide.languages.map((language) => (
                  <View key={language} style={styles.languageItem}>
                    <MaterialIcons name="language" size={16} color="#0066cc" />
                    <Text style={styles.languageText}>{language}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Areas Covered</Text>
              <View style={styles.areasContainer}>
                {currentGuide.areas.map((area) => (
                  <View key={area} style={styles.areaItem}>
                    <MaterialIcons name="place" size={16} color="#FF6B6B" />
                    <Text style={styles.areaText}>{area}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Contact Information</Text>
              <View style={styles.contactContainer}>
                <View style={styles.contactItem}>
                  <MaterialIcons name="email" size={16} color="#0066cc" />
                  <Text style={styles.contactText}>
                    {currentGuide.contactInfo.email}
                  </Text>
                </View>

                <View style={styles.contactItem}>
                  <MaterialIcons name="phone" size={16} color="#0066cc" />
                  <Text style={styles.contactText}>
                    {currentGuide.contactInfo.phone}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === "gallery" && (
            <View>
              <FlatList
                data={currentGuide.gallery}
                renderItem={renderGalleryItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal={false}
                scrollEnabled={false}
              />
            </View>
          )}

          {activeTab === "availability" && renderAvailability()}
        </View>
      </ScrollView>

      {/* Booking button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate("BookGuide", { guideId: currentGuide.id })
          }
        >
          <Text style={styles.bookButtonText}>Book This Guide</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "white",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  nameContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginRight: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
    color: "#666",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  infoText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#666",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#0066cc",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#0066cc",
    fontWeight: "bold",
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#333",
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#444",
  },
  expertiseContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  expertiseItem: {
    backgroundColor: "#e6f2ff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  expertiseText: {
    color: "#0066cc",
    fontWeight: "500",
  },
  languagesContainer: {
    marginBottom: 10,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  languageText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#444",
  },
  areasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  areaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  areaText: {
    marginLeft: 5,
    color: "#FF6B6B",
  },
  contactContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
  },
  galleryItem: {
    marginBottom: 15,
  },
  galleryImage: {
    width: imageWidth,
    height: 200,
    borderRadius: 10,
  },
  availabilityContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  availabilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  availableIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  availableText: {
    color: "white",
    marginLeft: 5,
  },
  unavailableIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  unavailableText: {
    color: "white",
    marginLeft: 5,
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

export default GuideDetailsScreen;
