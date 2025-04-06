import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import en from "./translations/en.json";
import si from "./translations/si.json";
import ta from "./translations/ta.json";

const LANGUAGES = {
  en: "English",
  si: "සිංහල", // Sinhala
  ta: "தமிழ்", // Tamil
};

const LANGUAGE_DETECTOR = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    try {
      // Check if user has manually set a language
      const savedLanguage = await AsyncStorage.getItem("user-language");

      if (savedLanguage) {
        return callback(savedLanguage);
      }

      // Get device locale
      const deviceLocale = Localization.locale.split("-")[0];

      // If device locale is one of our supported languages, use it
      if (Object.keys(LANGUAGES).includes(deviceLocale)) {
        return callback(deviceLocale);
      }

      // Default to English
      return callback("en");
    } catch (error) {
      console.error("Error detecting language:", error);
      return callback("en");
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem("user-language", language);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem("user-language", language);
  } catch (error) {
    console.error("Error changing language:", error);
  }
};

export const getAvailableLanguages = () => {
  return Object.keys(LANGUAGES).map((code) => ({
    code,
    name: LANGUAGES[code],
  }));
};

export const getCurrentLanguage = () => {
  return i18n.language || "en";
};

export default i18n;
