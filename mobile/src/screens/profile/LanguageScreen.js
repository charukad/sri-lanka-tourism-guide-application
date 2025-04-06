import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  getAvailableLanguages,
  getCurrentLanguage,
  changeLanguage,
} from "../../i18n";
import colors from "../../constants/colors";

const LanguageScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  useEffect(() => {
    // Get all available languages
    const availableLanguages = getAvailableLanguages();
    setLanguages(availableLanguages);

    // Get current language
    const currentLang = getCurrentLanguage();
    setSelectedLanguage(currentLang);
  }, []);

  const handleLanguageSelect = async (langCode) => {
    if (langCode !== selectedLanguage) {
      // Change app language
      await changeLanguage(langCode);
      setSelectedLanguage(langCode);

      // Navigate back to settings screen
      navigation.goBack();
    }
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage === item.code && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text
        style={[
          styles.languageName,
          selectedLanguage === item.code && styles.selectedLanguageName,
        ]}
      >
        {item.name}
      </Text>

      {selectedLanguage === item.code && (
        <Ionicons name="checkmark" size={22} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>{t("profile.language")}</Text>
      </View>

      <FlatList
        data={languages}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textDark,
  },
  listContainer: {
    padding: 20,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  selectedLanguageItem: {
    backgroundColor: colors.lightBackground,
  },
  languageName: {
    fontSize: 16,
    color: colors.textDark,
  },
  selectedLanguageName: {
    fontWeight: "bold",
    color: colors.primary,
  },
});

export default LanguageScreen;
