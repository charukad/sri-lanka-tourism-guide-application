import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";

// Components
import PostCard from "../../components/social/PostCard";

const { width } = Dimensions.get("window");

const UserProfileScreen = ({ route, navigation }) => {
  const { userId, userName } = route.params;
  const { posts } = useSelector((state) => state.social);

  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch user posts
  useEffect(() => {
    // In a real app, fetch posts by user ID from an API
    // For now, filter from existing posts
    setIsLoading(true);

    setTimeout(() => {
      const filteredPosts = posts.filter((post) => post.userId === userId);
      setUserPosts(filteredPosts);
      setIsLoading(false);
    }, 500);
  }, [userId, posts]);

  // Mock user data (in a real app, this would come from an API)
  const userData = {
    id: userId,
    name: userName,
    avatar:
      posts.find((post) => post.userId === userId)?.userAvatar ||
      "https://randomuser.me/api/portraits/men/1.jpg",
    bio: "Passionate traveler exploring the beauty of Sri Lanka. Sharing my journey and experiences with fellow adventurers.",
    postsCount: userPosts.length,
    followersCount: 256,
    followingCount: 124,
    isFollowing: false,
  };

  // Render post item
  const renderPostItem = ({ item }) => (
    <PostCard
      post={item}
      onPostPress={() =>
        navigation.navigate("PostDetails", { postId: item.id })
      }
      onLikePress={() => {}}
      onCommentPress={() =>
        navigation.navigate("PostDetails", {
          postId: item.id,
          focusComment: true,
        })
      }
      onLocationPress={() => {
        navigation.navigate("ExploreTab", {
          screen: "ExploreMap",
          params: {
            focusLocation: {
              latitude: item.location.latitude,
              longitude: item.location.longitude,
              name: item.location.name,
            },
          },
        });
      }}
      onProfilePress={() => {}}
    />
  );

  // Render post grid item
  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate("PostDetails", { postId: item.id })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
      <View style={styles.gridItemOverlay}>
        <View style={styles.gridItemStat}>
          <MaterialIcons name="favorite" size={16} color="white" />
          <Text style={styles.gridItemStatText}>{item.likes}</Text>
        </View>
        <View style={styles.gridItemStat}>
          <MaterialIcons name="comment" size={16} color="white" />
          <Text style={styles.gridItemStatText}>{item.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userData.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: userData.avatar }}
            style={styles.profileAvatar}
          />

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileBio}>{userData.bio}</Text>

          <TouchableOpacity
            style={[
              styles.followButton,
              userData.isFollowing && styles.followingButton,
            ]}
          >
            <Text
              style={[
                styles.followButtonText,
                userData.isFollowing && styles.followingButtonText,
              ]}
            >
              {userData.isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "posts" && styles.activeTab]}
            onPress={() => setActiveTab("posts")}
          >
            <MaterialIcons
              name="view-agenda"
              size={24}
              color={activeTab === "posts" ? "#0066cc" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "grid" && styles.activeTab]}
            onPress={() => setActiveTab("grid")}
          >
            <MaterialIcons
              name="grid-on"
              size={24}
              color={activeTab === "grid" ? "#0066cc" : "#666"}
            />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : userPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="photo-library" size={60} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Posts Yet</Text>
            <Text style={styles.emptyStateText}>
              This user hasn't shared any posts.
            </Text>
          </View>
        ) : activeTab === "posts" ? (
          <FlatList
            data={userPosts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Disable scrolling for nested FlatList
          />
        ) : (
          <FlatList
            data={userPosts.filter(
              (post) => post.images && post.images.length > 0
            )}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false} // Disable scrolling for nested FlatList
            contentContainerStyle={styles.gridContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="photo-library" size={60} color="#ccc" />
                <Text style={styles.emptyStateTitle}>No Photos</Text>
                <Text style={styles.emptyStateText}>
                  This user hasn't shared any photos.
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  profileStats: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  followButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  followButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  followingButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  followingButtonText: {
    color: "#333",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    marginTop: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#0066cc",
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    padding: 30,
    alignItems: "center",
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
  gridContainer: {
    paddingVertical: 5,
  },
  gridItem: {
    width: (width - 6) / 3, // Divide screen into 3 columns with small gaps
    height: (width - 6) / 3,
    marginHorizontal: 1,
    marginVertical: 1,
    position: "relative",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridItemOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  gridItemStat: {
    flexDirection: "row",
    alignItems: "center",
  },
  gridItemStatText: {
    color: "white",
    marginLeft: 3,
    fontSize: 12,
  },
});

export default UserProfileScreen;
