import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import alertService from "../../services/alertService";
import colors from "../../constants/colors";
import { formatDistanceToNow } from "date-fns";

const AlertsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load alerts when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [])
  );

  // Load user alerts
  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertService.getUserAlerts();
      setAlerts(response.data.data);
    } catch (error) {
      Alert.alert(t("errors.somethingWentWrong"), t("errors.tryAgain"));
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId) => {
    try {
      await alertService.markAlertAsRead(alertId);

      // Update local state
      setAlerts(
        alerts.map((alert) =>
          alert._id === alertId
            ? { ...alert, read: true, read_at: new Date() }
            : alert
        )
      );
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  // Mark all alerts as read
  const markAllAsRead = async () => {
    try {
      await alertService.markAllAlertsAsRead();

      // Update local state
      setAlerts(
        alerts.map((alert) => ({ ...alert, read: true, read_at: new Date() }))
      );
    } catch (error) {
      console.error("Error marking all alerts as read:", error);
    }
  };

  // Navigate based on alert type
  const handleAlertPress = (alert) => {
    // Mark as read if not already read
    if (!alert.read) {
      markAlertAsRead(alert._id);
    }

    // Navigate based on alert type and reference
    switch (alert.type) {
      case "weather":
        // Navigate to weather screen if location is available
        if (alert.location) {
          navigation.navigate("WeatherDetails", { locationId: alert.location });
        }
        break;

      case "booking":
        // Navigate to booking details
        if (alert.reference_model === "GuideBooking") {
          navigation.navigate("GuideBookingDetails", {
            bookingId: alert.reference,
          });
        } else if (alert.reference_model === "VehicleBooking") {
          navigation.navigate("VehicleBookingDetails", {
            bookingId: alert.reference,
          });
        }
        break;

      case "location-subscription":
        // Navigate to location details
        if (alert.location) {
          navigation.navigate("LocationDetails", {
            locationId: alert.location,
          });
        }
        break;

      case "system":
      case "user-notification":
        // Just show the alert, no navigation needed
        break;

      default:
        break;
    }
  };

  // Get severity icon and color
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case "high":
        return {
          icon: "warning",
          color: colors.danger,
        };
      case "medium":
        return {
          icon: "alert-circle",
          color: colors.warning,
        };
      case "low":
      default:
        return {
          icon: "information-circle",
          color: colors.info,
        };
    }
  };

  // Render each alert item
  const renderAlertItem = ({ item }) => {
    const severityStyles = getSeverityStyles(item.severity);
    const timeAgo = formatDistanceToNow(new Date(item.created_at), {
      addSuffix: true,
    });

    return (
      <TouchableOpacity
        style={[styles.alertItem, !item.read && styles.unreadAlert]}
        onPress={() => handleAlertPress(item)}
      >
        <View style={styles.alertIconContainer}>
          <Ionicons
            name={severityStyles.icon}
            size={24}
            color={severityStyles.color}
          />
        </View>

        <View style={styles.alertContent}>
          <Text style={styles.alertTitle}>{item.title}</Text>
          <Text style={styles.alertMessage}>{item.message}</Text>
          <Text style={styles.alertTime}>{timeAgo}</Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("notifications.notifications")}</Text>

        {alerts.length > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>
              {t("notifications.markAllAsRead")}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : alerts.length > 0 ? (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.alertsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="notifications-off"
            size={80}
            color={colors.lightGray}
          />
          <Text style={styles.emptyText}>
            {t("notifications.noNotifications")}
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>{t("common.refresh")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textDark,
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  alertsList: {
    padding: 10,
  },
  alertItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadAlert: {
    backgroundColor: colors.lightBackground,
  },
  alertIconContainer: {
    marginRight: 15,
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.textDark,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.textMedium,
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    alignSelf: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMedium,
    marginTop: 10,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AlertsScreen;
