// FIXED VERSION – Enhanced UI + Themed Buttons + Date/Time Pickers + Fixed Delete

import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  Button,
  IconButton,
  ActivityIndicator,
  Divider,
  SegmentedButtons,
  Chip,
  Avatar,
  Portal,
  Dialog,
} from "react-native-paper";
import {
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  UserMinus,
  BarChart3,
  Clock,
  CalendarDays,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import Header from "../../Components/layout/Header";
import { format } from "date-fns";
import axiosInstance from "../../axiosInstance";

const THEME = "#C21807"; // scarlet red
const THEME_LIGHT = "#FFE4E1";
const THEME_GRADIENT = ["#C21807", "#E35F5F"];

export default function AdminEventDashboard() {
  // 🔒 ALL HOOKS DECLARED FIRST
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  
  // Date/Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    remark: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  // ================= API =================

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/events/admin/summary/all");
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch {
      Alert.alert("Error", "Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get("/events/admin/stats");
      setStats(res.data || {});
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEvents(), fetchStats()]);
    setRefreshing(false);
  };

  const createEvent = async () => {
    try {
      setLoading(true);
      await axiosInstance.post("/events", formData);
      closeModal();
      fetchEvents();
      Alert.alert("Success", "Event created successfully");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/events/${selectedEvent._id}`, formData);
      closeModal();
      fetchEvents();
      Alert.alert("Success", "Event updated successfully");
    } catch {
      Alert.alert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (event) => {
    if (!event?._id) return;
    setEventToDelete(event);
    setDeleteDialogVisible(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete?._id) return;
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/events/${eventToDelete._id}`);
      setDeleteDialogVisible(false);
      setEventToDelete(null);
      fetchEvents();
      Alert.alert("Success", "Event deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date || "",
      time: event.time || "",
      location: event.location || "",
      remark: event.remark || "",
    });
    setModalType("edit");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
    setFormData({ 
      title: "", 
      description: "", 
      date: "", 
      time: "", 
      location: "", 
      remark: "" 
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempDate(selectedDate);
      setFormData({ 
        ...formData, 
        date: format(selectedDate, "yyyy-MM-dd") 
      });
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setFormData({ 
        ...formData, 
        time: format(selectedTime, "HH:mm") 
      });
    }
  };

  const openDatePicker = () => {
    setTempDate(formData.date ? new Date(formData.date) : new Date());
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  // 🛡️ SAFE FILTER
  const filteredEvents = Array.isArray(events)
    ? events.filter((e) => {
        if (filterStatus === "upcoming") return new Date(e.date) >= new Date();
        if (filterStatus === "past") return new Date(e.date) < new Date();
        return true;
      })
    : [];

  const getStatusColor = (date) => {
    const eventDate = new Date(date);
    const today = new Date();
    return eventDate >= today ? THEME : "#666";
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[THEME]}
            tintColor={THEME}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>
                Event Management
              </Text>
              {/* <Text  style={styles.headerSubtitle}>
                Manage and monitor all events
              </Text> */}
            </View>
            <Button
            
              mode="contained"
              buttonColor={THEME}
              textColor="#fff"
              style={styles.createButton}
              contentStyle={styles.createButtonContent}
              icon={() => <Plus size={20} color="#fff" />}
              onPress={() => { 
                setModalType("create"); 
                setModalVisible(true); 
              }}
            >
              New Event
            </Button>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <Stat 
              label="Total Events" 
              value={stats.totalEvents} 
              icon={<Calendar size={24} color={THEME} />}
              bgColor={THEME_LIGHT}
            />
            <Stat 
              label="Attendees" 
              value={stats.totalAttendees} 
              icon={<UserCheck size={24} color={THEME} />}
              bgColor={THEME_LIGHT}
            />
            <Stat 
              label="Responses" 
              value={stats.totalResponses} 
              icon={<BarChart3 size={24} color={THEME} />}
              bgColor={THEME_LIGHT}
            />
          </View>

          {/* Filter Section */}
          <View style={styles.filterSection}>
            <SegmentedButtons
              value={filterStatus}
              onValueChange={setFilterStatus}
              buttons={[
                { 
                  value: "all", 
                  label: "All Events",
                  style: filterStatus === 'all' && styles.activeFilter
                },
                { 
                  value: "upcoming", 
                  label: "Upcoming",
                  style: filterStatus === 'upcoming' && styles.activeFilter
                },
                { 
                  value: "past", 
                  label: "Past",
                  style: filterStatus === 'past' && styles.activeFilter
                },
              ]}
              style={styles.segmentedButtons}
              theme={{ colors: { secondaryContainer: THEME_LIGHT } }}
            />
          </View>

          {/* Events List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME} />
              <Text style={styles.loadingText}>Loading events...</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CalendarDays size={48} color="#ccc" />
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubtext}>
                {filterStatus === 'all' 
                  ? 'Create your first event to get started' 
                  : `No ${filterStatus} events available`}
              </Text>
              {filterStatus !== 'all' && (
                <Button 
                  mode="outlined" 
                  onPress={() => setFilterStatus('all')}
                  textColor={THEME}
                  style={styles.viewAllButton}
                >
                  View All Events
                </Button>
              )}
            </View>
          ) : (
            filteredEvents.map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                onEdit={openEdit}
                onDelete={confirmDelete}
                theme={THEME}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <View style={[styles.modalIcon, { backgroundColor: THEME_LIGHT }]}>
                {modalType === "create" ? (
                  <Plus size={20} color={THEME} />
                ) : (
                  <Edit size={20} color={THEME} />
                )}
              </View>
              <Text variant="titleLarge" style={styles.modalTitle}>
                {modalType === "create" ? "Create New Event" : "Edit Event"}
              </Text>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              {/* Title Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Event Title</Text>
                <TextInput
                  placeholder="e.g., Annual Conference 2024"
                  value={formData.title}
                  onChangeText={(t) => setFormData({ ...formData, title: t })}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Description Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  placeholder="Describe your event..."
                  value={formData.description}
                  onChangeText={(t) => setFormData({ ...formData, description: t })}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Date & Time Section */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputWrapper, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity 
                    style={styles.dateTimeButton} 
                    onPress={openDatePicker}
                  >
                    <Calendar size={20} color={THEME} />
                    <Text style={formData.date ? styles.dateTimeText : styles.dateTimePlaceholder}>
                      {formData.date ? format(new Date(formData.date), "dd MMM yyyy") : "Select date"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputWrapper, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TouchableOpacity 
                    style={styles.dateTimeButton} 
                    onPress={openTimePicker}
                  >
                    <Clock size={20} color={THEME} />
                    <Text style={formData.time ? styles.dateTimeText : styles.dateTimePlaceholder}>
                      {formData.time || "Select time"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  placeholder="e.g., Convention Center, Online"
                  value={formData.location}
                  onChangeText={(t) => setFormData({ ...formData, location: t })}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Remark Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Remarks (Optional)</Text>
                <TextInput
                  placeholder="Additional notes..."
                  value={formData.remark}
                  onChangeText={(t) => setFormData({ ...formData, remark: t })}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={closeModal}
                  style={styles.modalCancelButton}
                  textColor="#666"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  buttonColor={THEME}
                  textColor="#fff"
                  onPress={modalType === "create" ? createEvent : updateEvent}
                  loading={loading}
                  style={styles.modalSaveButton}
                  contentStyle={styles.modalSaveButtonContent}
                >
                  {modalType === "create" ? "Create Event" : "Save Changes"}
                </Button>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Date Picker */}
      {showDatePicker && (
  <DateTimePicker
    value={tempDate}
    mode="date"
    display={Platform.OS === "ios" ? "spinner" : "default"}
    onChange={(event, date) => {
      setShowDatePicker(false);
      if (date) {
        setTempDate(date);
        setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
      }
    }}
  />
)}

{showTimePicker && (
  <DateTimePicker
    value={new Date()}
    mode="time"
    display={Platform.OS === "ios" ? "spinner" : "default"}
    onChange={(event, time) => {
      setShowTimePicker(false);
      if (time) {
        setFormData({ ...formData, time: format(time, "HH:mm") });
      }
    }}
  />
)}


      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog 
          visible={deleteDialogVisible} 
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Icon icon="alert" size={40} color={THEME} />
          <Dialog.Title style={styles.dialogTitle}>Delete Event</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to delete "{eventToDelete?.title}"? 
              This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button 
              onPress={() => setDeleteDialogVisible(false)}
              textColor="#666"
            >
              Cancel
            </Button>
            <Button 
              onPress={handleDelete}
              textColor={THEME}
              loading={loading}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

// Enhanced Stat Component
const Stat = ({ label, value, icon, bgColor }) => (
  <Card style={[styles.statCard, { backgroundColor: bgColor }]}>
    <Card.Content style={styles.statContent}>
      <View style={styles.statIconContainer}>
        {icon}
      </View>
      <Text variant="headlineMedium" style={styles.statValue}>
        {value || 0}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card.Content>
  </Card>
);

// Enhanced Event Card Component
const EventCard = ({ event, onEdit, onDelete, theme }) => {
  const isUpcoming = new Date(event.date) >= new Date();
  
  return (
    <Card style={[styles.card, isUpcoming && styles.upcomingCard]}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <View style={[styles.eventStatusDot, { backgroundColor: isUpcoming ? theme : '#999' }]} />
            <Text variant="titleMedium" style={styles.cardTitle}>
              {event.title}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <IconButton
              icon={() => <Edit size={18} color={theme} />}
              onPress={() => onEdit(event)}
              style={styles.actionButton}
            />
            <IconButton
              icon={() => <Trash2 size={18} color={theme} />}
              onPress={() => onDelete(event)}
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.eventMetaContainer}>
          <Chip 
            icon={() => <Calendar size={14} color={theme} />} 
            style={[styles.metaChip, { backgroundColor: theme + '10' }]}
            textStyle={{ color: theme }}
          >
            {format(new Date(event.date), "dd MMM yyyy")}
          </Chip>
          <Chip 
            icon={() => <Clock size={14} color={theme} />}
            style={[styles.metaChip, { backgroundColor: theme + '10' }]}
            textStyle={{ color: theme }}
          >
            {event.time}
          </Chip>
          <Chip 
            icon={() => <MapPin size={14} color={theme} />}
            style={[styles.metaChip, { backgroundColor: theme + '10' }]}
            textStyle={{ color: theme }}
          >
            {event.location}
          </Chip>
        </View>

        {event.description && (
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <Divider style={styles.divider} />

        <View style={styles.attendanceStats}>
          <View style={styles.statItem}>
            <View style={[styles.statIndicator, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.statCount}>{event.stats?.attending || 0}</Text>
            <Text style={styles.statLabel}>Yes</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIndicator, { backgroundColor: '#F44336' }]} />
            <Text style={styles.statCount}>{event.stats?.notAttending || 0}</Text>
            <Text style={styles.statLabel}>No</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIndicator, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.statCount}>{event.stats?.maybe || 0}</Text>
            <Text style={styles.statLabel}>Maybe</Text>
          </View>
        </View>

        {event.remark && (
          <View style={styles.remarkContainer}>
            <AlertCircle size={14} color="#666" />
            <Text style={styles.remarkText}>{event.remark}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA" 
  },
  content: { 
    padding: 6 
  },
  headerRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: 14 
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#1A1A1A",
    fontSize: 18,
  },
  headerSubtitle: {
    color: "#666",
    marginTop: 4,
  },
  createButton: {
    borderRadius: 12,
    elevation: 0,
    
  },
  createButtonContent: {
    height: 48,
    paddingHorizontal: 0,
  },
  statsRow: { 
    flexDirection: "row", 
    gap: 12, 
    marginBottom: 24 
  },
  statCard: { 
    flex: 1, 
    borderRadius: 16,
    elevation: 2,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: 6,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  statLabel: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  filterSection: {
    marginBottom: 20,
  },
  segmentedButtons: {
    borderRadius: 12,
  },
  activeFilter: {
    backgroundColor: THEME_LIGHT,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  viewAllButton: {
    marginTop: 16,
    borderColor: THEME,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  upcomingCard: {
    borderLeftWidth: 4,
    borderLeftColor: THEME,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  eventStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  cardTitle: {
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
  },
  actionButton: {
    margin: 0,
  },
  eventMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  metaChip: {
    height: 32,
    borderRadius: 16,
  },
  eventDescription: {
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  divider: {
    marginVertical: 12,
  },
  attendanceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statCount: {
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  remarkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  remarkText: {
    marginLeft: 8,
    color: "#666",
    fontSize: 12,
    flex: 1,
  },
  // Modal Styles
  modalContainer: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1A1A1A",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FAFAFA",
  },
  dateTimeText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#1A1A1A",
  },
  dateTimePlaceholder: {
    marginLeft: 10,
    fontSize: 16,
    color: "#999",
  },
 modalActions: {
  flexDirection: "row",
  gap: 12,
  flexWrap: "wrap",
},

  modalCancelButton: {
    flex: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 0,
  },
  modalSaveButtonContent: {
    height: 48,
  },
  // Dialog Styles
  dialog: {
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  dialogTitle: {
    textAlign: "center",
    color: "#1A1A1A",
  },
  dialogText: {
    textAlign: "center",
    color: "#666",
    lineHeight: 20,
  },
  dialogActions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export { AdminEventDashboard };