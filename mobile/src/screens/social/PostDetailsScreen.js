import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { MaterialIcons } from "@expo/vector-icons";
import {
  fetchPostById,
  fetchCommentsByPostId,
  likePost,
  unlikePost,
  addComment,
  likeComment,
} from "../../store/slices/socialSlice";

const { width } = Dimensions.get("window");

const PostDetailsScreen = ({ route, navigation }) => {
  const { postId, focusComment } = route.params;
  const dispatch = useDispatch();
  const { currentPost, comments, loading } = useSelector(
    (state) => state.social
  );
  const { user } = useSelector((state) => state.auth);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Fetch post and comments when component mounts
  useEffect(() => {
    dispatch(fetchPostById(postId));
    dispatch(fetchCommentsByPostId(postId));
  }, [dispatch, postId]);

  // Focus comment input if requested
  useEffect(() => {
    if (focusComment && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 500);
    }
  }, [focusComment]);

  // Handle like button press
  const handleLikePost = () => {
    setIsLiked(!isLiked);

    if (isLiked) {
      dispatch(unlikePost({ postId }));
    } else {
      dispatch(likePost({ postId }));
    }
  };

  // Handle comment like
  const handleLikeComment = (commentId) => {
    dispatch(likeComment({ commentId }));
  };

  // Handle image slide
  const handleScroll = (event) => {
    const slideWidth = width;
    const currentIndex = Math.floor(
      event.nativeEvent.contentOffset.x / slideWidth
    );
    setCurrentImageIndex(currentIndex);
  };

  // Handle submit comment
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    dispatch(
      addComment({
        postId,
        userId: user.id, // In a real app, get this from auth state
        userName: user.name || "Current User", // In a real app, get this from auth state
        userAvatar:
          user.avatar || "https://randomuser.me/api/portraits/men/1.jpg", // Default avatar
        content: commentText.trim(),
      })
    );

    setCommentText("");
    setIsSubmitting(false);

    // Scroll to bottom to show the new comment
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  if (loading || !currentPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  // Render image item
  const renderImageItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: item }}
        style={styles.postImage}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity style={styles.moreButton} onPress={() => {}}>
          <MaterialIcons name="more-vert" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Post header with user info */}
        <View style={styles.postHeader}>
          <Image
            source={{ uri: currentPost.userAvatar }}
            style={styles.userAvatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{currentPost.userName}</Text>
            <View style={styles.postMeta}>
              <Text style={styles.timeText}>
                {formatDate(currentPost.createdAt)}
              </Text>
              {currentPost.location && (
                <>
                  <Text style={styles.metaDot}>•</Text>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("ExploreTab", {
                        screen: "ExploreMap",
                        params: {
                          focusLocation: {
                            latitude: currentPost.location.latitude,
                            longitude: currentPost.location.longitude,
                            name: currentPost.location.name,
                          },
                        },
                      });
                    }}
                  >
                    <Text style={styles.locationText}>
                      {currentPost.location.name}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Post content */}
        <Text style={styles.postContent}>{currentPost.content}</Text>

        {/* Post images */}
        {currentPost.images && currentPost.images.length > 0 && (
          <View style={styles.imageSlider}>
            <FlatList
              data={currentPost.images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
            />

            {/* Image indicators */}
            {currentPost.images.length > 1 && (
              <View style={styles.indicatorsContainer}>
                {currentPost.images.map((_, index) => (
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
        {currentPost.tags && currentPost.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {currentPost.tags.map((tag, index) => (
              <TouchableOpacity key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Post stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {currentPost.likes} likes • {currentPost.comments} comments
          </Text>
        </View>

        {/* Post actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLikePost}
          >
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
            onPress={() => commentInputRef.current?.focus()}
          >
            <MaterialIcons name="comment-outline" size={22} color="#666" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="share" size={22} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Comments section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments</Text>

          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>
              No comments yet. Be the first to comment!
            </Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Image
                  source={{ uri: comment.userAvatar }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentUserName}>
                      {comment.userName}
                    </Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                  <View style={styles.commentActions}>
                    <Text style={styles.commentTimeText}>
                      {formatDate(comment.createdAt)}
                    </Text>
                    <TouchableOpacity
                      style={styles.commentLikeButton}
                      onPress={() => handleLikeComment(comment.id)}
                    >
                      <Text style={styles.commentActionText}>Like</Text>
                      <Text style={styles.commentLikeCount}>
                        {comment.likes}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.commentReplyButton}>
                      <Text style={styles.commentActionText}>Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={styles.commentInputContainer}>
        <Image
          source={{
            uri:
              user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
          }}
          style={styles.commentInputAvatar}
        />
        <TextInput
          ref={commentInputRef}
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!commentText.trim() || isSubmitting) && styles.disabledSendButton,
          ]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name="send" size={18} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  postHeader: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "white",
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
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    backgroundColor: "white",
  },
  imageSlider: {
    width: width,
    height: 300,
  },
  imageContainer: {
    width: width,
    height: 300,
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
    paddingTop: 15,
    backgroundColor: "white",
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
    backgroundColor: "white",
  },
  statsText: {
    fontSize: 14,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "white",
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
  commentsSection: {
    marginTop: 10,
    backgroundColor: "white",
    padding: 15,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  noCommentsText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 20,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
  },
  commentUserName: {
    fontWeight: "bold",
    marginBottom: 3,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 5,
    alignItems: "center",
  },
  commentTimeText: {
    fontSize: 12,
    color: "#666",
    marginRight: 10,
  },
  commentLikeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  commentReplyButton: {
    marginRight: 10,
  },
  commentActionText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  commentLikeCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 3,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },
  commentInputAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  disabledSendButton: {
    backgroundColor: "#cccccc",
  },
});

export default PostDetailsScreen;
