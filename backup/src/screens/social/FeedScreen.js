import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const dummyPosts = [
  {
    id: "1",
    user: { name: "Jane Smith", avatar: "https://via.placeholder.com/50" },
    location: "Sigiriya Rock Fortress",
    content: "Breathtaking view from the top of Sigiriya!",
    image: "https://via.placeholder.com/400x300",
    likes: 24,
    comments: 5,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    user: { name: "Mike Johnson", avatar: "https://via.placeholder.com/50" },
    location: "Galle Fort",
    content: "Exploring the historic Galle Fort. Amazing architecture!",
    image: "https://via.placeholder.com/400x300",
    likes: 18,
    comments: 3,
    timestamp: "5 hours ago",
  },
];

const FeedScreen = () => {
  const renderItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="favorite-border" size={24} color="black" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="comment" size={24} color="black" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Travel Feed</Text>
      <FlatList
        data={dummyPosts}
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
  postCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: "bold",
  },
  location: {
    color: "gray",
    fontSize: 12,
  },
  postImage: {
    width: "100%",
    height: 300,
  },
  postActions: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  actionText: {
    marginLeft: 5,
  },
  content: {
    padding: 10,
  },
  timestamp: {
    padding: 10,
    color: "gray",
    fontSize: 12,
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

export default FeedScreen;
