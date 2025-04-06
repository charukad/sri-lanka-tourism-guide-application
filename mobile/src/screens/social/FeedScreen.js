import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import {
  fetchPosts,
  likePost,
  unlikePost,
} from "../../store/slices/socialSlice";

// Components
import PostCard from "../../components/social/PostCard";

const FeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.social);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch posts when component mounts
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchPosts());
    setRefreshing(false);
  };

  // Handle like/unlike post
  const handleLikePress = (post, isLiked) => {
    if (isLiked) {
      dispatch(unlikePost({ postId: post.id }));
    } else {
      dispatch(likePost({ postId: post.id }));
    }
  };

  // Render post item
  const renderPostItem = ({ item }) => (
    <PostCard
      post={item}
      onPostPress={() =>
        navigation.navigate("PostDetails", { postId: item.id })
      }
      onLikePress={handleLikePress}
      onCommentPress={() =>
        navigation.navigate("PostDetails", {
          postId: item.id,
          focusComment: true,
        })
      }
      onLocationPress={() => {
        if (item.location) {
          navigation.navigate("Explore", {
            screen: "ExploreMap",
            params: { focusLocation: item.location },
          });
        }
      }}
      onProfilePress={() =>
        navigation.navigate("UserProfile", {
          userId: item.userId,
          userName: item.userName,
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Travel Feed</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("CreatePost")}
        >
          <MaterialIcons name="add" size={24} color="#0066cc" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#0066cc"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="photo-library" size={60} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No posts yet</Text>
              <Text style={styles.emptyStateText}>
                Be the first to share your Sri Lanka travel experience!
              </Text>
              <TouchableOpacity
                style={styles.createPostButton}
                onPress={() => navigation.navigate("CreatePost")}
              >
                <Text style={styles.createPostButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          }
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  feedList: {
    paddingBottom: 20,
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
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  createPostButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FeedScreen;
