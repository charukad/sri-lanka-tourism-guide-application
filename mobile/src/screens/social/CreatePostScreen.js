import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../store/slices/socialSlice";

const CreatePostScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request permission for media library
  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Sorry, we need camera roll permissions to upload images!"
          );
        }
      }
    })();
  }, []);

  // Pick images from gallery
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
      });

      if (!result.canceled && result.assets) {
        // Get image URIs from the result
        const selectedImages = result.assets.map((asset) => asset.uri);

        // Check if adding new images would exceed limit
        if (images.length + selectedImages.length > 5) {
          Alert.alert(
            "Limit Exceeded",
            "You can upload up to 5 images per post."
          );
          return;
        }

        setImages([...images, ...selectedImages]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  // Remove image from selection
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Choose location
  const chooseLocation = () => {
    // In a real app, you would navigate to a location picker screen
    // For now, we'll just set a dummy location
    navigation.navigate("ChooseLocation", {
      onLocationSelect: (selectedLocation) => {
        setLocation(selectedLocation);
      },
    });
  };

  // Add tag
  const addTag = () => {
    const tag = tagInput.trim().replace(/\s+/g, ""); // Remove spaces

    if (!tag) return;

    if (tags.includes(tag)) {
      Alert.alert("Duplicate Tag", "This tag has already been added.");
      return;
    }

    if (tags.length >= 10) {
      Alert.alert("Limit Exceeded", "You can add up to 10 tags per post.");
      return;
    }

    setTags([...tags, tag]);
    setTagInput("");
  };

  // Remove tag
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Submit post
  const handleSubmit = async () => {
    // Validate content
    if (!content.trim()) {
      Alert.alert("Missing Content", "Please add some text to your post.");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would upload images and then create the post
      // For now, we'll just use the local URIs

      dispatch(
        createPost({
          userId: user?.id || "u1", // In a real app, get this from auth state
          userName: user?.name || "Current User", // In a real app, get this from auth state
          userAvatar:
            user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg", // Default avatar
          content: content.trim(),
          images,
          location,
          tags,
        })
      );

      setIsSubmitting(false);

      // Show success message and navigate back
      Alert.alert("Post Created", "Your post has been created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("Error", "Failed to create post. Please try again.");
    }
  };

  // Render image item
  const renderImageItem = ({ item, index }) => (
    <View style={styles.imagePreviewContainer}>
      <Image source={{ uri: item }} style={styles.imagePreview} />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => removeImage(index)}
      >
        <MaterialIcons name="close" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[
            styles.postButton,
            (!content.trim() || isSubmitting) && styles.disabledPostButton,
          ]}
          onPress={handleSubmit}
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                user?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
            }}
            style={styles.userAvatar}
          />
          <View>
            <Text style={styles.userName}>{user?.name || "Current User"}</Text>
            {location && (
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={14} color="#0066cc" />
                <Text style={styles.locationText}>{location.name}</Text>
              </View>
            )}
          </View>
        </View>

        <TextInput
          style={styles.contentInput}
          placeholder="Share your Sri Lanka experience..."
          multiline
          value={content}
          onChangeText={setContent}
          autoFocus
          textAlignVertical="top"
        />

        {images.length > 0 && (
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            contentContainerStyle={styles.imageList}
            showsHorizontalScrollIndicator={false}
          />
        )}

        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <View style={styles.tagsHeader}>
              <MaterialIcons name="tag" size={18} color="#666" />
              <Text style={styles.tagsTitle}>Tags</Text>
            </View>
            <View style={styles.tagsList}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tagItem}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => removeTag(index)}
                  >
                    <MaterialIcons name="close" size={12} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.addTagContainer}>
          <TextInput
            style={styles.tagInput}
            placeholder="Add a tag..."
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={addTag}
          />
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={addTag}
            disabled={!tagInput.trim()}
          >
            <MaterialIcons
              name="add"
              size={20}
              color={tagInput.trim() ? "#0066cc" : "#ccc"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={pickImages}
            disabled={images.length >= 5}
          >
            <MaterialIcons
              name="photo-library"
              size={24}
              color={images.length >= 5 ? "#ccc" : "#0066cc"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={chooseLocation}
          >
            <MaterialIcons name="location-on" size={24} color="#0066cc" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  cancelButton: {
    padding: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  postButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledPostButton: {
    backgroundColor: "#cccccc",
  },
  scrollView: {
    flex: 1,
  },
  userInfo: {
    flexDirection: "row",
    padding: 15,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  locationText: {
    fontSize: 14,
    color: "#0066cc",
    marginLeft: 3,
  },
  contentInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    minHeight: 150,
  },
  imageList: {
    padding: 10,
  },
  imagePreviewContainer: {
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tagsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  tagsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#0066cc",
    marginRight: 5,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    padding: 15,
  },
  addTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  tagInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  addTagButton: {
    padding: 5,
  },
  actionButtons: {
    flexDirection: "row",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
});

export default CreatePostScreen;
