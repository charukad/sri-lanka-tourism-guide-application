import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  
  // State for settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'සිංහල' },
    { code: 'ta', name: 'தமிழ்' },
  ];

  const handleLanguageChange = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem('userLanguage', languageCode);
      // You might want to dispatch an action to update the language in your Redux store
      Alert.alert(
        t('settings.languageChanged'),
        t('settings.languageChangeSuccess'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        t('settings.languageChangeError'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logoutConfirmTitle'),
      t('settings.logoutConfirmMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.clear();
              // Dispatch logout action
              // dispatch(logout());
              // Navigate to auth screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const renderSettingSwitch = (title, value, onValueChange, description) => (
    <View style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={value ? '#007AFF' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
      </View>
      {description && (
        <Text style={styles.settingDescription}>{description}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        {renderSettingSwitch(
          t('settings.pushNotifications'),
          pushNotifications,
          setPushNotifications,
          t('settings.pushNotificationsDesc')
        )}
        {renderSettingSwitch(
          t('settings.emailNotifications'),
          emailNotifications,
          setEmailNotifications,
          t('settings.emailNotificationsDesc')
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        {renderSettingSwitch(
          t('settings.darkMode'),
          darkMode,
          setDarkMode,
          t('settings.darkModeDesc')
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
        {renderSettingSwitch(
          t('settings.locationServices'),
          locationServices,
          setLocationServices,
          t('settings.locationServicesDesc')
        )}
        {renderSettingSwitch(
          t('settings.offlineMode'),
          offlineMode,
          setOfflineMode,
          t('settings.offlineModeDesc')
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.languageContainer}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                i18n.language === lang.code && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  i18n.language === lang.code && styles.languageButtonTextActive,
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>{t('common.logout')}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  settingItem: {
    marginBottom: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  languageButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  languageButtonText: {
    color: '#333',
    fontSize: 16,
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
    fontSize: 14,
  },
});

export default SettingsScreen; 