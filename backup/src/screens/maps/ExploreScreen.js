import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const ExploreScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Explore Sri Lanka</Text>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 7.8731,
          longitude: 80.7718,
          latitudeDelta: 3,
          longitudeDelta: 3,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 15,
    marginTop: 30,
  },
  map: {
    flex: 1,
  },
});

export default ExploreScreen;
