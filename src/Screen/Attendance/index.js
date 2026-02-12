import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import {
  Card,
  Text,
  Button,
  Chip,
  Avatar,
  IconButton,
  Badge,
  ActivityIndicator,
  Divider,
  SegmentedButtons,
} from "react-native-paper";
import {
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Eye,
  UserCheck,
  UserX,
  UserMinus,
  BarChart3,
} from "lucide-react-native";
import Header from "../../Components/layout/Header";
import { format } from "date-fns";
import axiosInstance from "../../axiosInstance";

// axiosInstance Service
// import axiosInstance from "../../Services/axiosInstance";

export default function AdminEventDashboard() {
  // State Management
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create"); // create, edit, view
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Event Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    remark: "",
  });

  // Statistics State
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalResponses: 0,
    avgAttendance: 0,
  });

  // Load Events on Mount
  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  // Fetch All Events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/events/admin/summary/all");
      setEvents(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Statistics
  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/events/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Stats error:", error);
    }
  };

  // Refresh Handler
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEvents(), fetchStats()]);
    setRefreshing(false);
  };

  // Create Event
  const createEvent = async () => {
    try {
      setLoading(true);
      await axiosInstance.post("/events", formData);
      Alert.alert("Success", "Event created successfully");
      setModalVisible(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  // Update Event
  const updateEvent = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/events/${selectedEvent._id}`, formData);
      Alert.alert("Success", "Event updated successfully");
      setModalVisible(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      Alert.alert("Error", "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  // Delete Event
  const deleteEvent = async (eventId) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(`/events/${eventId}`);
              Alert.alert("Success", "Event deleted successfully");
              fetchEvents();
            } catch (error) {
              Alert.alert("Error", "Failed to delete event");
            }
          },
        },
      ]
    );
  };

  // View Event Details
  const viewEventDetails = async (event) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/events/admin/report/${event._id}`);
      setSelectedEvent(response.data);
      setModalType("view");
      setModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };

  // Edit Event
  const editEvent = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      date: event.date,
      time: event.time,
      location: event.location,
      remark: event.remark || "",
    });
    setModalType("edit");
    setModalVisible(true);
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      remark: "",
    });
    setSelectedEvent(null);
  };

  // Export Attendance
  const exportAttendance = (event) => {
    // Implement CSV export
    Alert.alert("Export", `Exporting attendance for ${event.title}`);
  };

  // Filter Events
  const filteredEvents = events.filter((event) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "upcoming") {
      return new Date(event.date) >= new Date();
    }
    if (filterStatus === "past") {
      return new Date(event.date) < new Date();
    }
    return true;
  });

  // Render Statistics Cards
  const renderStatsCards = () => (
    <View style={styles.statsGrid}>
      <Card style={styles.statsCard}>
        <Card.Content>
          <Calendar color="#2196F3" size={24} />
          <Text variant="headlineMedium">{stats.totalEvents}</Text>
          <Text variant="bodySmall">Total Events</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <UserCheck color="#4CAF50" size={24} />
          <Text variant="headlineMedium">{stats.totalAttendees}</Text>
          <Text variant="bodySmall">Total Attendees</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Users color="#FF9800" size={24} />
          <Text variant="headlineMedium">{stats.totalResponses}</Text>
          <Text variant="bodySmall">Responses</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <BarChart3 color="#9C27B0" size={24} />
          <Text variant="headlineMedium">{stats.avgAttendance}%</Text>
          <Text variant="bodySmall">Avg Attendance</Text>
        </Card.Content>
      </Card>
    </View>
  );

  // Render Event Card
  const renderEventCard = (event) => (
    <Card key={event._id} style={styles.eventCard}>
      <Card.Content>
        <View style={styles.eventHeader}>
          <View style={styles.eventTitleSection}>
            <Text variant="titleMedium" style={styles.eventTitle}>
              {event.title}
            </Text>
            <Badge
              style={[
                styles.statusBadge,
                {
                  backgroundColor: new Date(event.date) >= new Date()
                    ? "#4CAF50"
                    : "#9E9E9E",
                },
              ]}
            >
              {new Date(event.date) >= new Date() ? "Upcoming" : "Past"}
            </Badge>
          </View>
          <View style={styles.eventActions}>
            <IconButton
              icon={() => <Eye size={20} color="#2196F3" />}
              onPress={() => viewEventDetails(event)}
            />
            <IconButton
              icon={() => <Edit size={20} color="#FF9800" />}
              onPress={() => editEvent(event)}
            />
            <IconButton
              icon={() => <Trash2 size={20} color="#F44336" />}
              onPress={() => deleteEvent(event._id)}
            />
          </View>
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#666" />
            <Text variant="bodySmall" style={styles.detailText}>
              {format(new Date(event.date), "dd MMM yyyy")} at {event.time}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#666" />
            <Text variant="bodySmall" style={styles.detailText}>
              {event.location}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <UserCheck size={16} color="#4CAF50" />
            <Text variant="bodyMedium" style={styles.statNumber}>
              {event.stats?.attending || 0}
            </Text>
            <Text variant="bodySmall">Attending</Text>
          </View>
          <View style={styles.statItem}>
            <UserX size={16} color="#F44336" />
            <Text variant="bodyMedium" style={styles.statNumber}>
              {event.stats?.notAttending || 0}
            </Text>
            <Text variant="bodySmall">Not Attending</Text>
          </View>
          <View style={styles.statItem}>
            <UserMinus size={16} color="#FF9800" />
            <Text variant="bodyMedium" style={styles.statNumber}>
              {event.stats?.maybe || 0}
            </Text>
            <Text variant="bodySmall">Maybe</Text>
          </View>
        </View>

        <View style={styles.responseRate}>
          <Text variant="bodySmall">
            Response Rate: {Math.round((event.stats?.totalResponses / 50) * 100)}%
          </Text>
          <Button
            mode="text"
            onPress={() => exportAttendance(event)}
            icon={() => <Download size={16} color="#2196F3" />}
            compact
          >
            Export
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Render Event Details Modal
  const renderEventModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text variant="titleLarge">
              {modalType === "create"
                ? "Create Event"
                : modalType === "edit"
                ? "Edit Event"
                : "Event Details"}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setModalVisible(false)}
            />
          </View>

          <ScrollView>
            {modalType === "view" && selectedEvent ? (
              // View Mode
              <View>
                <Card style={styles.modalCard}>
                  <Card.Content>
                    <Text variant="titleMedium">{selectedEvent.eventTitle}</Text>
                    <Text variant="bodyMedium">
                      {format(new Date(selectedEvent.eventDate), "dd MMM yyyy")}
                    </Text>

                    <View style={styles.attendanceSummary}>
                      <Text variant="titleSmall" style={styles.summaryTitle}>
                        Attendance Summary
                      </Text>
                      
                      <View style={styles.summaryStats}>
                        <View style={styles.summaryItem}>
                          <UserCheck color="#4CAF50" size={24} />
                          <Text variant="headlineSmall">
                            {selectedEvent.summary?.attending || 0}
                          </Text>
                          <Text>Attending</Text>
                        </View>
                        <View style={styles.summaryItem}>
                          <UserX color="#F44336" size={24} />
                          <Text variant="headlineSmall">
                            {selectedEvent.summary?.notAttending || 0}
                          </Text>
                          <Text>Not Attending</Text>
                        </View>
                        <View style={styles.summaryItem}>
                          <UserMinus color="#FF9800" size={24} />
                          <Text variant="headlineSmall">
                            {selectedEvent.summary?.maybe || 0}
                          </Text>
                          <Text>Maybe</Text>
                        </View>
                      </View>
                    </View>

                    <Divider />

                    {/* Attendees List */}
                    <View style={styles.attendeesSection}>
                      <SegmentedButtons
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                        buttons={[
                          { value: "attending", label: "Attending" },
                          { value: "not attending", label: "Apologies" },
                          { value: "maybe", label: "Maybe" },
                        ]}
                      />

                      <ScrollView style={styles.attendeesList}>
                        {selectedEvent.attendees
                          ?.filter((a) => a.status === filterStatus)
                          .map((attendee, index) => (
                            <View key={index} style={styles.attendeeItem}>
                              <Avatar.Text
                                size={40}
                                label={attendee.user?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              />
                              <View style={styles.attendeeInfo}>
                                <Text variant="bodyMedium">
                                  {attendee.user?.name}
                                </Text>
                                <Text variant="bodySmall">
                                  {attendee.user?.email}
                                </Text>
                                <Text variant="bodySmall" style={styles.respondedAt}>
                                  Responded:{" "}
                                  {format(
                                    new Date(attendee.respondedAt),
                                    "dd MMM yyyy, hh:mm a"
                                  )}
                                </Text>
                              </View>
                            </View>
                          ))}
                      </ScrollView>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            ) : (
              // Create/Edit Mode
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Event Title"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Description"
                  multiline
                  numberOfLines={4}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date (YYYY-MM-DD)"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Time"
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  value={formData.location}
                  onChangeText={(text) =>
                    setFormData({ ...formData, location: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Remark (Optional)"
                  value={formData.remark}
                  onChangeText={(text) =>
                    setFormData({ ...formData, remark: text })
                  }
                />

                <Button
                  mode="contained"
                  onPress={modalType === "create" ? createEvent : updateEvent}
                  loading={loading}
                  style={styles.submitButton}
                >
                  {modalType === "create" ? "Create Event" : "Update Event"}
                </Button>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text variant="headlineSmall" style={styles.mainTitle}>
              Event Management
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                resetForm();
                setModalType("create");
                setModalVisible(true);
              }}
              icon={() => <Plus size={20} color="#fff" />}
            >
              New Event
            </Button>
          </View>

          {/* Statistics Cards */}
          {renderStatsCards()}

          {/* Tabs */}
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={[
              { value: "events", label: "All Events" },
              { value: "upcoming", label: "Upcoming" },
              { value: "past", label: "Past Events" },
            ]}
            style={styles.tabButtons}
          />

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <View style={styles.filterChips}>
              <Chip
                selected={filterStatus === "all"}
                onPress={() => setFilterStatus("all")}
                style={styles.filterChip}
              >
                All
              </Chip>
              <Chip
                selected={filterStatus === "upcoming"}
                onPress={() => setFilterStatus("upcoming")}
                style={styles.filterChip}
              >
                Upcoming
              </Chip>
              <Chip
                selected={filterStatus === "past"}
                onPress={() => setFilterStatus("past")}
                style={styles.filterChip}
              >
                Past
              </Chip>
              <Chip
                selected={filterStatus === "high-response"}
                onPress={() => setFilterStatus("high-response")}
                style={styles.filterChip}
              >
                High Response
              </Chip>
            </View>
          </ScrollView>

          {/* Events List */}
          {loading && !refreshing ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <View style={styles.eventsList}>
              {filteredEvents.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Card.Content style={styles.emptyContent}>
                    <Calendar size={48} color="#ccc" />
                    <Text variant="bodyLarge" style={styles.emptyText}>
                      No events found
                    </Text>
                    <Text variant="bodySmall" style={styles.emptySubtext}>
                      Click "New Event" to create your first event
                    </Text>
                  </Card.Content>
                </Card>
              ) : (
                filteredEvents.map(renderEventCard)
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Event Modal */}
      {renderEventModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    minWidth: "45%",
    marginBottom: 8,
  },
  tabButtons: {
    marginBottom: 16,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChips: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  eventsList: {
    gap: 16,
  },
  eventCard: {
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventTitle: {
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
  },
  eventActions: {
    flexDirection: "row",
  },
  eventDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    color: "#666",
  },
  divider: {
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "700",
    marginTop: 4,
  },
  responseRate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loader: {
    marginTop: 40,
  },
  emptyCard: {
    marginTop: 20,
  },
  emptyContent: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 8,
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalCard: {
    marginBottom: 16,
  },
  form: {
    gap: 16,
    paddingBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  attendanceSummary: {
    marginVertical: 20,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  summaryItem: {
    alignItems: "center",
  },
  attendeesSection: {
    marginTop: 20,
  },
  attendeesList: {
    maxHeight: 400,
    marginTop: 16,
  },
  attendeeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  attendeeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  respondedAt: {
    color: "#999",
    marginTop: 4,
  },
});