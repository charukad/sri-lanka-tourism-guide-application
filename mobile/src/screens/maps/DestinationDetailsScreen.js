// Add this import
import { useSelector } from "react-redux";

// Inside the component, add this
const { itineraries, currentItinerary } = useSelector(
  (state) => state.itinerary
);

// Replace the "Add to Itinerary" button with this
<TouchableOpacity
  style={styles.actionButton}
  onPress={() => {
    if (itineraries.length === 0) {
      // If no itineraries, prompt to create one
      Alert.alert(
        "No Itineraries",
        "You need to create an itinerary first before adding destinations.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Create Itinerary",
            onPress: () => navigation.navigate("CreateItinerary"),
          },
        ]
      );
    } else {
      // Navigate to itinerary selector
      navigation.navigate("AddToItinerary", { destination });
    }
  }}
>
  <MaterialIcons name="add-to-photos" size={20} color="white" />
  <Text style={styles.actionButtonText}>Add to Itinerary</Text>
</TouchableOpacity>;
