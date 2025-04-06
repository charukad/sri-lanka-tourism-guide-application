import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const dummyItineraries = [
  {
    id: "1",
    title: "Beach Adventure",
    startDate: "2023-06-01",
    endDate: "2023-06-07",
  },
  {
    id: "2",
    title: "Cultural Tour",
    startDate: "2023-07-15",
    endDate: "2023-07-25",
  },
  {
    id: "3",
    title: "Wildlife Safari",
    startDate: "2023-08-10",
    endDate: "2023-08-15",
  },
];

const ItinerariesScreen = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itineraryCard}>
      <View style={styles.itineraryHeader}>
        <Text style={styles.itineraryTitle}>{item.title}</Text>
        <MaterialIcons name="edit" size={24} color="#0066cc" />
      </View>
      <Text style={styles.dateText}>
        {item.startDate} to {item.endDate}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>My Itineraries</Text>
      <FlatList
        data={dummyItineraries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.addButton}>
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 15,
    marginTop: 30,
  },
  list: {
    padding: 10,
  },
  itineraryCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
  },
  itineraryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateText: {
    color: "gray",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#0066cc",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default ItinerariesScreen;
