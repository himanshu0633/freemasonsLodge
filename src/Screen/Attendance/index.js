import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from "react-native";
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  Avatar,
} from "react-native-paper";
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Zap,
  BarChart3,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../Components/layout/Header";
import axiosInstance from "../../axiosInstance";
import { format, isPast, isToday, isFuture } from "date-fns";

const SCARLET_RED = "#C21807";
const DARK_RED = "#8B1205";
const LIGHT_RED = "#FFE5E0";
const { width } = Dimensions.get("window");

export default function Attendance() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userData");
      if (!storedUser) {
        Alert.alert("Error", "User data not found");
        return;
      }
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser._id);
    } catch (error) {
      Alert.alert("Error", "Failed to load user data");
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/events/admin/all");
      setEvents(res.data?.events || []);
    } catch {
      Alert.alert("Error", "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, []);

  const markAttendance = async (eventId, status) => {
    if (!userId) {
      Alert.alert("Error", "User not loaded yet");
      return;
    }

    try {
      await axiosInstance.post(`/events/${eventId}/attendance`, {
        status,
        userId,
      });
      fetchEvents();
    } catch (error) {
      Alert.alert("Error", "Could not update attendance");
    }
  };

  const isEventPast = (eventDate) => {
    const eventDateTime = new Date(eventDate);
    return isPast(eventDateTime) && !isToday(eventDateTime);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "attending":
        return "#10B981";
      case "not_attending":
        return "#EF4444";
      case "maybe":
        return "#F59E0B";
      default:
        return "#9CA3AF";
    }
  };

  const renderStatusIcon = (status) => {
    const color = getStatusColor(status);
    if (status === "attending") return <CheckCircle size={14} color={color} />;
    if (status === "not_attending") return <XCircle size={14} color={color} />;
    if (status === "maybe") return <Clock size={14} color={color} />;
    return <Clock size={14} color="#9CA3AF" />;
  };

  const getStatusText = (status) => {
    if (status === "attending") return "Going";
    if (status === "not_attending") return "Not Going";
    if (status === "maybe") return "Maybe";
    return "Not Responded";
  };

  const calculateAttendancePercentage = (stats) => {
    const total = (stats?.attending ?? 0) + (stats?.maybe ?? 0) + (stats?.notAttending ?? 0);
    if (total === 0) return 0;
    return Math.round(((stats?.attending ?? 0) / total) * 100);
  };

  // Separate events
  const upcomingEvents = events.filter(event => !isEventPast(event.date));
  const pastEvents = events.filter(event => isEventPast(event.date));

  const renderCompactEventCard = (event) => {
    const eventDate = new Date(event.date);
    const isPastEvent = isEventPast(event.date);
    const attendancePercent = calculateAttendancePercentage(event.stats);
    const totalAttendees = (event.stats?.attending ?? 0) + (event.stats?.maybe ?? 0) + (event.stats?.notAttending ?? 0);

    return (
      <TouchableOpacity
        key={event._id}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.compactCard,
            isPastEvent && styles.pastCompactCard,
          ]}
        >
          {/* Date & Title Row */}
          <View style={styles.cardTopRow}>
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>
                {format(eventDate, "MMM dd")}
              </Text>
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.compactTitle} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.compactdesc}>
                {event.description}
              </Text>
              <View style={styles.timeLocationRow}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.timeText}>{format(eventDate, "h:mm a")}</Text>
                <MapPin size={12} color="#6B7280" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statIndicator}>
              <View style={[styles.statDot, { backgroundColor: "#10B981" }]} />
              <Text style={styles.statSmallValue}>{event.stats?.attending ?? 0}</Text>
            </View>
            <View style={styles.statIndicator}>
              <View style={[styles.statDot, { backgroundColor: "#F59E0B" }]} />
              <Text style={styles.statSmallValue}>{event.stats?.maybe ?? 0}</Text>
            </View>
            <View style={styles.statIndicator}>
              <View style={[styles.statDot, { backgroundColor: "#EF4444" }]} />
              <Text style={styles.statSmallValue}>{event.stats?.notAttending ?? 0}</Text>
            </View>
            <View style={styles.totalIndicator}>
              <Users size={12} color="#6B7280" />
              <Text style={styles.totalValue}>{totalAttendees}</Text>
            </View>

            {/* Status Display */}
            {!isPastEvent && event.myStatus && (
              <View style={[styles.myStatusBadge, { backgroundColor: getStatusColor(event.myStatus) + '20' }]}>
                {renderStatusIcon(event.myStatus)}
                <Text style={[styles.myStatusText, { color: getStatusColor(event.myStatus) }]}>
                  {getStatusText(event.myStatus)}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons - Compact */}
          {!isPastEvent && (
            <View style={styles.compactActionButtons}>
              <TouchableOpacity
                style={[
                  styles.compactActionBtn,
                  event.myStatus === "attending" && { backgroundColor: "#10B981" }
                ]}
                onPress={() => markAttendance(event._id, "attending")}
              >
                <CheckCircle
                  size={16}
                  color={event.myStatus === "attending" ? "#fff" : "#10B981"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.compactActionBtn,
                  event.myStatus === "maybe" && { backgroundColor: "#F59E0B" }
                ]}
                onPress={() => markAttendance(event._id, "maybe")}
              >
                <Clock
                  size={16}
                  color={event.myStatus === "maybe" ? "#fff" : "#F59E0B"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.compactActionBtn,
                  event.myStatus === "not_attending" && { backgroundColor: "#EF4444" }
                ]}
                onPress={() => markAttendance(event._id, "not_attending")}
              >
                <XCircle
                  size={16}
                  color={event.myStatus === "not_attending" ? "#fff" : "#EF4444"}
                />
              </TouchableOpacity>
            </View>
          )}

          {isPastEvent && (
            <View style={styles.pastLabel}>
              <Text style={styles.pastLabelText}>Past Event</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const statsOverview = {
    totalEvents: events.length,
    upcomingCount: upcomingEvents.length,
    pastCount: pastEvents.length,
    totalAttending: events.reduce((acc, e) => acc + (e.stats?.attending ?? 0), 0),
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       {/* <Header /> */}
  //       <ActivityIndicator size="large" color={SCARLET_RED} />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.mainContainer}>
      <Header />
{loading && <ActivityIndicator size="large" color={SCARLET_RED} />}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={SCARLET_RED} />
        }
      >
        <View style={styles.content}>
          {/* Compact Header Stats */}
          <View style={styles.headerStats}>
            <View style={styles.headerStatItem}>
              <View style={[styles.headerStatIcon, { backgroundColor: LIGHT_RED }]}>
                <Calendar size={20} color={SCARLET_RED} />
              </View>
              <View>
                <Text style={styles.headerStatValue}>{statsOverview.totalEvents}</Text>
                <Text style={styles.headerStatLabel}>Total</Text>
              </View>
            </View>

            <View style={styles.headerStatItem}>
              <View style={[styles.headerStatIcon, { backgroundColor: "#DBEAFE" }]}>
                <TrendingUp size={20} color="#0EA5E9" />
              </View>
              <View>
                <Text style={styles.headerStatValue}>{statsOverview.upcomingCount}</Text>
                <Text style={styles.headerStatLabel}>Upcoming</Text>
              </View>
            </View>

            <View style={styles.headerStatItem}>
              <View style={[styles.headerStatIcon, { backgroundColor: "#F3E8FF" }]}>
                <BarChart3 size={20} color="#A855F7" />
              </View>
              <View>
                <Text style={styles.headerStatValue}>{statsOverview.totalAttending}</Text>
                <Text style={styles.headerStatLabel}>Attending</Text>
              </View>
            </View>
          </View>

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 ? (
            <View>
              <View style={styles.sectionHeader}>
                <Zap size={18} color={SCARLET_RED} />
                <Text style={styles.sectionTitle}>
                  Upcoming Events ({upcomingEvents.length})
                </Text>
              </View>
              <View style={styles.eventsContainer}>
                {upcomingEvents
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map(event => renderCompactEventCard(event))}
              </View>
            </View>
          ) : null}

          {/* Past Events Section */}
          {pastEvents.length > 0 && (
            <View style={styles.pastEventsSection}>
              <View style={styles.sectionHeader}>
                <Calendar size={18} color="#9CA3AF" />
                <Text style={[styles.sectionTitle, { color: "#6B7280" }]}>
                  Past Events ({pastEvents.length})
                </Text>
              </View>
              <View style={styles.eventsContainer}>
                {pastEvents
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 5)
                  .map(event => renderCompactEventCard(event))}
              </View>
              {pastEvents.length > 5 && (
                <View style={styles.viewMoreContainer}>
                  <Text style={styles.viewMoreText}>
                    +{pastEvents.length - 5} more past events
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Empty State */}
          {events.length === 0 && (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: LIGHT_RED }]}>
                <Calendar size={48} color={SCARLET_RED} />
              </View>
              <Text style={styles.emptyTitle}>No Events Yet</Text>
              <Text style={styles.emptyText}>
                Events will appear here when created
              </Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  // loadingContainer: {
  //   // flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   backgroundColor: "#F9FAFB",
  // },
  content: {
    padding: 12,
  },

  // Header Stats
  headerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  headerStatItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  headerStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  // Compact Cards
  eventsContainer: {
    gap: 8,
  },
  compactCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: SCARLET_RED,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pastCompactCard: {
    backgroundColor: "#FAFAFA",
    borderLeftColor: "#D1D5DB",
    opacity: 0.75,
  },

  // Card Top Row
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  datePill: {
    backgroundColor: LIGHT_RED,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 55,
    alignItems: "center",
  },
  datePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: SCARLET_RED,
  },
  titleSection: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  compactdesc: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    marginBottom: 4,
  },
  timeLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  timeText: {
    fontSize: 11,
    color: "#6B7280",
    marginRight: 6,
  },
  locationText: {
    fontSize: 11,
    color: "#6B7280",
    flex: 1,
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  statIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statSmallValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  totalIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  myStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: "auto",
  },
  myStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Compact Action Buttons
  compactActionButtons: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "flex-end",
  },
  compactActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  // Past Event Label
  pastLabel: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  pastLabelText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontStyle: "italic",
  },

  // Past Events Section
  pastEventsSection: {
    marginTop: 12,
  },
  viewMoreContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  viewMoreText: {
    fontSize: 12,
    color: SCARLET_RED,
    fontWeight: "600",
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  bottomPadding: {
    height: 20,
  },
});
