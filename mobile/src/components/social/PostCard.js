import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const PostCard = ({
  post,
  onPostPress,
  onLikePress,
  onCommentPress,
  onLocationPress,
  onProfilePress,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Format relative time for post
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return "Just now";
    }
  };

  // Handle image slide
  const handleScroll = (event) => {
    const slideWidth = width;
    const currentIndex = Math.floor(
      event.nativeEvent.contentOffset.x / slideWidth
    );
    setCurrentImageIndex(currentIndex);
  };

  // Handle like button press
  const handleLikePress = () => {
    setIsLiked(!isLiked);
    onLikePress(post, isLiked);
  };

  // Render image item
  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageContainer}
      onPress={() => onPostPress()}
    >
      <Image
        source={{ uri: item }}
        style={styles.postImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  // Truncate content if it's too long
  const truncateContent = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "... See more";
  };

  return (
    <View style={styles.postCard}>
      {/* Post header with user info */}
      <TouchableOpacity
        style={styles.postHeader}
        onPress={() => onProfilePress()}
      >
        <Image source={{ uri: post.userAvatar }} style={styles.userAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{post.userName}</Text>
          <View style={styles.postMeta}>
            <Text style={styles.timeText}>
              {formatRelativeTime(post.createdAt)}
            </Text>
            {post.location && (
              <>
                <Text style={styles.metaDot}>•</Text>
                <TouchableOpacity onPress={() => onLocationPress()}>
                  <Text style={styles.locationText}>{post.location.name}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Post content */}
      <TouchableOpacity onPress={() => onPostPress()}>
        <Text style={styles.postContent}>{truncateContent(post.content)}</Text>
      </TouchableOpacity>

      {/* Post images */}
      {post.images && post.images.length > 0 && (
        <View style={styles.imageSlider}>
          <FlatList
            data={post.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
          />

          {/* Image indicators */}
          {post.images.length > 1 && (
            <View style={styles.indicatorsContainer}>
              {post.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentImageIndex === index && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Post stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {post.likes} likes • {post.comments} comments
        </Text>
      </View>

      {/* Post actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
          <MaterialIcons
            name={isLiked ? "favorite" : "favorite-outline"}
            size={22}
            color={isLiked ? "#FF6B6B" : "#666"}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onCommentPress()}
        >
          <MaterialIcons name="comment-outline" size={22} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={22} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "white",
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    padding: 15,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
  metaDot: {
    marginHorizontal: 5,
    fontSize: 12,
    color: "#666",
  },
  locationText: {
    fontSize: 12,
    color: "#0066cc",
  },
  postContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    fontSize: 14,
    lineHeight: 20,
    color: "#333",
  },
  imageSlider: {
    width: width,
    height: 250,
  },
  imageContainer: {
    width: width,
    height: 250,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: "white",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    paddingTop: 5,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#0066cc",
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  statsText: {
    fontSize: 12,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  actionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  likedText: {
    color: "#FF6B6B",
  },
});

export default PostCard;
