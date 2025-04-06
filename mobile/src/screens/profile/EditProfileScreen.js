import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import colors from "../../constants/colors";
import {
  updateProfile,
  uploadProfilePicture,
} from "../../store/slices/userSlice";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phone_number || "");
      setProfilePic(user.profile_pic || null);
    }
  }, [user]);

  const pickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "You need to grant permission to access your photo library"
      );
      return;
    }

    // Pick image
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.cancelled && result.uri) {
      // Upload profile picture
      uploadImage(result.uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setIsSaving(true);

      // Create form data
      const formData = new FormData();
      formData.append("image", {
        uri,
        type: "image/jpeg",
        name: "profile-picture.jpg",
      });

      // Dispatch upload action
      await dispatch(uploadProfilePicture(formData)).unwrap();
      setIsSaving(false);

      Alert.alert("Success", "Profile picture updated successfully");
    } catch (error) {
      setIsSaving(false);
      Alert.alert("Error", error.message || "Failed to upload profile picture");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validate inputs
      if (!username.trim()) {
        Alert.alert("Error", "Username is required");
        setIsSaving(false);
        return;
      }

      if (!email.trim()) {
        Alert.alert("Error", "Email is required");
        setIsSaving(false);
        return;
      }

      // Dispatch update action
      await dispatch(
        updateProfile({
          username,
          email,
          phone_number: phoneNumber,
        })
      ).unwrap();

      setIsSaving(false);
      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      setIsSaving(false);
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.profilePicContainer}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <View style={[styles.profilePic, styles.noProfilePic]}>
            <Ionicons name="person" size={50} color={colors.lightGray} />
          </View>
        )}

        <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textDark,
  },
  profilePicContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  noProfilePic: {
    backgroundColor: colors.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    marginTop: 10,
    padding: 10,
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.textDark,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfileScreen;
