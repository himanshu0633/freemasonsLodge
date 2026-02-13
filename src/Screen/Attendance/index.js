import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Chip,
  ActivityIndicator,
  Avatar,
  Divider,
  IconButton,
} from "react-native-paper";
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../Components/layout/Header";
import axiosInstance from "../../axiosInstance";
import { format, isPast, isToday, isFuture } from "date-fns";

const THEME = "#C21807";
const { width } = Dimensions.get("window");

export default function Attendance() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [expandedPast, setExpandedPast] = useState(false);

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
        return "#2e7d32";
      case "not_attending":
        return "#c62828";
      case "maybe":
        return "#f9a825";
      default:
        return "#aaa";
    }
  };

  const renderStatusIcon = (status) => {
    const color = getStatusColor(status);
    if (status === "attending") return <CheckCircle size={16} color={color} />;
    if (status === "not_attending") return <XCircle size={16} color={color} />;
    if (status === "maybe") return <Clock size={16} color={color} />;
    return <Clock size={16} color="#aaa" />;
  };

  const getStatusText = (status) => {
    if (status === "attending") return "Going";
    if (status === "not_attending") return "Not Going";
    if (status === "maybe") return "Maybe";
    return "Not Responded";
  };

  // Separate events
  const upcomingEvents = events.filter(event => !isEventPast(event.date));
  const pastEvents = events.filter(event => isEventPast(event.date));
  
  // Get next upcoming event
  const nextEvent = upcomingEvents.length > 0 
    ? upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date))[0] 
    : null;

  const renderEventCard = (event, isNextEvent = false) => {
    const eventDate = new Date(event.date);
    const isPastEvent = isEventPast(event.date);
    const isTodayEvent = isToday(eventDate);
    
    return (
      <Card 
        key={event._id} 
        style={[
          styles.eventCard,
          isNextEvent && styles.nextEventCard,
          isTodayEvent && styles.todayEventCard,
          isPastEvent && styles.pastEventCard,
        ]}
      >
        <Card.Content>
          {/* Event Header with Status Badge */}
          <View style={styles.eventHeader}>
            <View style={styles.eventHeaderLeft}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateDay}>{format(eventDate, "dd")}</Text>
                <Text style={styles.dateMonth}>{format(eventDate, "MMM")}</Text>
              </View>
              <View style={styles.eventTitleContainer}>
                <Text variant="titleMedium" style={styles.eventTitle}>
                  {event.title}
                </Text>
                <View style={styles.eventMeta}>
                  <View style={styles.metaItem}>
                    <Clock size={14} color="#666" />
                    <Text variant="bodySmall" style={styles.metaText}>
                      {format(eventDate, "h:mm a")}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#666" />
                    <Text variant="bodySmall" style={styles.metaText} numberOfLines={1}>
                      {event.location}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {!isPastEvent && event.myStatus && (
              <View style={[styles.statusChip, { backgroundColor: getStatusColor(event.myStatus) + '20' }]}>
                {renderStatusIcon(event.myStatus)}
                <Text style={[styles.statusText, { color: getStatusColor(event.myStatus) }]}>
                  {getStatusText(event.myStatus)}
                </Text>
              </View>
            )}
          </View>

          {/* Stats Section - Compact */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#2e7d32" }]} />
              <Text style={styles.statLabel}>Yes</Text>
              <Text style={styles.statValue}>{event.stats?.attending ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#f9a825" }]} />
              <Text style={styles.statLabel}>Maybe</Text>
              <Text style={styles.statValue}>{event.stats?.maybe ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: "#c62828" }]} />
              <Text style={styles.statLabel}>No</Text>
              <Text style={styles.statValue}>{event.stats?.notAttending ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={14} color="#666" />
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>
                {(event.stats?.attending ?? 0) + (event.stats?.maybe ?? 0) + (event.stats?.notAttending ?? 0)}
              </Text>
            </View>
          </View>

          {/* Action Buttons - Only for upcoming events and not past */}
          {!isPastEvent && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  event.myStatus === "attending" && styles.actionButtonActive,
                  { borderColor: THEME }
                ]}
                onPress={() => markAttendance(event._id, "attending")}
              >
                <CheckCircle 
                  size={18} 
                  color={event.myStatus === "attending" ? THEME : "#666"} 
                />
                <Text style={[
                  styles.actionButtonText,
                  event.myStatus === "attending" && styles.actionButtonTextActive
                ]}>
                  Yes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  event.myStatus === "maybe" && styles.actionButtonActive,
                  { borderColor: "#f9a825" }
                ]}
                onPress={() => markAttendance(event._id, "maybe")}
              >
                <Clock 
                  size={18} 
                  color={event.myStatus === "maybe" ? "#f9a825" : "#666"} 
                />
                <Text style={[
                  styles.actionButtonText,
                  event.myStatus === "maybe" && { color: "#f9a825" }
                ]}>
                  Maybe
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  event.myStatus === "not_attending" && styles.actionButtonActive,
                  { borderColor: "#c62828" }
                ]}
                onPress={() => markAttendance(event._id, "not_attending")}
              >
                <XCircle 
                  size={18} 
                  color={event.myStatus === "not_attending" ? "#c62828" : "#666"} 
                />
                <Text style={[
                  styles.actionButtonText,
                  event.myStatus === "not_attending" && { color: "#c62828" }
                ]}>
                  No
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Past Event Label */}
          {isPastEvent && (
            <View style={styles.pastEventLabel}>
              <Clock size={14} color="#999" />
              <Text style={styles.pastEventText}>Past Event</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Header />
        <ActivityIndicator size="large" color={THEME} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Header />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME} />
        }
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View>
              <Text style={styles.welcomeTitle}>Event Attendance</Text>
              <Text style={styles.welcomeSubtitle}>
                {upcomingEvents.length} upcoming event{upcomingEvents.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Avatar.Icon 
              size={50} 
              icon="calendar-check" 
              style={{ backgroundColor: THEME + '20' }}
              color={THEME}
            />
          </View>

          {/* Next Event Highlight */}
          {nextEvent && (
            <View style={styles.nextEventSection}>
              <View style={styles.nextEventHeader}>
                <TrendingUp size={20} color={THEME} />
                <Text style={styles.nextEventTitle}>Next Upcoming</Text>
              </View>
              {renderEventCard(nextEvent, true)}
            </View>
          )}

          {/* Other Upcoming Events */}
          {upcomingEvents.length > 1 && (
            <View style={styles.upcomingSection}>
              <Text style={styles.sectionTitle}>
                Other Upcoming Events
              </Text>
              {upcomingEvents
                .filter(event => event._id !== nextEvent?._id)
                .map(event => renderEventCard(event))}
            </View>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <View style={styles.pastSection}>
              <TouchableOpacity 
                style={styles.pastHeader}
                onPress={() => setExpandedPast(!expandedPast)}
              >
                <View style={styles.pastHeaderLeft}>
                  <Calendar size={20} color="#666" />
                  <Text style={styles.sectionTitle}>
                    Past Events ({pastEvents.length})
                  </Text>
                </View>
                <IconButton
                  icon={expandedPast ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
              
              {expandedPast && (
                <View style={styles.pastList}>
                  {pastEvents
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(event => renderEventCard(event))}
                </View>
              )}
            </View>
          )}

          {/* Empty State */}
          {events.length === 0 && (
            <View style={styles.emptyContainer}>
              <Calendar size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Events Found</Text>
              <Text style={styles.emptyText}>
                There are no events scheduled at the moment.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  nextEventSection: {
    marginBottom: 24,
  },
  nextEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextEventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: THEME,
  },
  upcomingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  eventCard: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  nextEventCard: {
    borderWidth: 2,
    borderColor: THEME,
    backgroundColor: '#fff',
  },
  todayEventCard: {
    borderLeftWidth: 4,
    borderLeftColor: THEME,
  },
  pastEventCard: {
    opacity: 0.8,
    backgroundColor: '#fafafa',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  dateBadge: {
    width: 50,
    height: 50,
    backgroundColor: THEME + '10',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME,
  },
  dateMonth: {
    fontSize: 12,
    color: THEME,
    textTransform: 'uppercase',
  },
  eventTitleContainer: {
    flex: 1,
  },
  eventTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#666',
    fontSize: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 6,
    backgroundColor: '#fff',
  },
  actionButtonActive: {
    backgroundColor: '#f8f8f8',
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  actionButtonTextActive: {
    color: THEME,
    fontWeight: '600',
  },
  pastSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  pastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  pastHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pastList: {
    gap: 12,
  },
  pastEventLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  pastEventText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});