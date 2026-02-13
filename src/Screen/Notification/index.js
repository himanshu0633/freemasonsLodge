import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import {
  Card,
  Text,
  Chip,
  Divider,
  IconButton,
  useTheme,
} from "react-native-paper";
import {
  Bell,
  FileText,
  Calendar,
  CheckCircle,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../Components/layout/Header";
import axiosInstance from "../../axiosInstance";
import io from "socket.io-client";
import API_URL from "../../api";

const { width } = Dimensions.get("window");
const THEME = "#C21807";

const ICONS = {
  event: Calendar,
  document: FileText,
};

const socket = io(API_URL , {
  transports: ["websocket"],
});

export default function NotificationPage() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------- Load Notifications ---------------- */

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch (e) {
      console.log("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();

    // 🔔 Real-time listener
    socket.on("new_notification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => socket.off("new_notification");
  }, []);

  /* ---------------- Pull to Refresh ---------------- */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  /* ---------------- Mark as Read ---------------- */

  const markAsRead = async (id) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (e) {
      console.log("Failed to mark as read");
    }
  };

  /* ---------------- Render ---------------- */

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.header}>
          <Bell size={26} color={THEME} />
          <Text style={styles.heading}>Notifications</Text>
        </View>

        {notifications.length > 0 ? (
          notifications.map(notification => {
            const Icon = ICONS[notification.type] || Bell;

            return (
              <Card
                key={notification._id}
                style={[
                  styles.card,
                  !notification.isRead && styles.unreadCard,
                ]}
                onPress={() => markAsRead(notification._id)}
              >
                <Card.Content>
                  <View style={styles.row}>
                    <View style={styles.iconWrapper}>
                      <Icon size={20} color={THEME} />
                    </View>

                    <View style={styles.content}>
                      <Text style={styles.title}>
                        {notification.title}
                      </Text>
                      <Text style={styles.message}>
                        {notification.message}
                      </Text>

                      <View style={styles.meta}>
                        <Chip
                          compact
                          style={[
                            styles.typeChip,
                            notification.type === "event"
                              ? styles.eventChip
                              : styles.documentChip,
                          ]}
                          textStyle={styles.chipText}
                        >
                          {notification.type.toUpperCase()}
                        </Chip>

                        {!notification.isRead && (
                          <Chip
                            compact
                            style={styles.newChip}
                            textStyle={styles.newChipText}
                          >
                            NEW
                          </Chip>
                        )}
                      </View>
                    </View>

                    {notification.isRead && (
                      <CheckCircle size={18} color="#2e7d32" />
                    )}
                  </View>
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Bell size={48} color="#ccc" />
              <Text style={styles.emptyText}>
                No notifications yet
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
  },
  heading: {
    fontSize: width < 400 ? 20 : 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: "#fff",
    elevation: 1,
  },
  unreadCard: {
    borderLeftWidth: 5,
    borderLeftColor: THEME,
    backgroundColor: "#fffdfc",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrapper: {
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  message: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  meta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  typeChip: {
    height: 26,
  },
  chipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  eventChip: {
    backgroundColor: "#c62828",
  },
  documentChip: {
    backgroundColor: "#1a237e",
  },
  newChip: {
    backgroundColor: THEME,
    height: 26,
  },
  newChipText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "700",
  },
  emptyCard: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
});
