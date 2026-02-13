import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
} from "react-native";
import {
  Card,
  Text,
  Chip,
  Divider,
  useTheme,
  Portal,
  Modal,
  IconButton,
} from "react-native-paper";
import { Calendar } from "react-native-calendars";
import {
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Users,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import Header from "../../Components/layout/Header";
import axiosInstance from "../../axiosInstance";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const THEME = "#C21807";

const EVENT_COLORS = {
  meeting: "#c62828",
  degree: "#f9a825",
  mentoring: "#2e7d32",
  admin: "#1a237e",
  default: "#C21807",
};

const STATUS_CONFIG = {
  attending: { color: "#2e7d32", label: "Going", icon: CheckCircle },
  maybe: { color: "#f9a825", label: "Maybe", icon: Users },
  not_attending: { color: "#c62828", label: "Not Going", icon: XCircle },
  no_response: { color: "#999", label: "No Response", icon: Users },
};

export default function CalendarPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(today);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) fetchEvents();
  }, [userId]);

  const loadUser = async () => {
    const stored = await AsyncStorage.getItem("userData");
    if (stored) setUserId(JSON.parse(stored)._id);
  };

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get("/events/admin/all");
      setEvents(res.data?.events || []);
    } catch (e) {
      console.log("Failed to load events");
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, []);

  // Group events by date with titles
  const eventsByDate = events.reduce((acc, event) => {
    if (!acc[event.date]) acc[event.date] = [];
    acc[event.date].push(event);
    return acc;
  }, {});

  /* ---------------- Enhanced Calendar Marking ---------------- */
  const markedDates = events.reduce(
    (acc, event) => {
      const date = event.date;
      const isSelected = date === selectedDate;
      const eventCount = eventsByDate[date]?.length || 0;
      
      acc[date] = {
        marked: true,
        dotColor: EVENT_COLORS[event.type] || EVENT_COLORS.default,
        dots: eventsByDate[date]?.map(e => ({
          key: e._id,
          color: EVENT_COLORS[e.type] || EVENT_COLORS.default,
          selectedDotColor: EVENT_COLORS[e.type] || EVENT_COLORS.default,
        })),
        customStyles: {
          container: {
            backgroundColor: isSelected ? THEME : 'transparent',
            borderRadius: isSelected ? 8 : 0,
          },
          text: {
            color: isSelected ? '#fff' : '#2d4150',
            fontWeight: isSelected ? 'bold' : 'normal',
          },
        },
        ...(eventCount > 0 && {
          customContainerStyle: {
            borderRadius: 8,
          },
        }),
      };

      // Add event titles for custom rendering
      if (eventCount > 0) {
        acc[date].eventTitles = eventsByDate[date]
          .slice(0, 2)
          .map(e => e.title);
        acc[date].moreCount = eventCount > 2 ? eventCount - 2 : 0;
      }

      return acc;
    },
    {
      [selectedDate]: {
        selected: true,
        selectedColor: THEME,
        customStyles: {
          container: {
            backgroundColor: THEME,
            borderRadius: 8,
          },
          text: {
            color: '#fff',
            fontWeight: 'bold',
          },
        },
      },
    }
  );

  // Add today marking
  if (!markedDates[today]?.selected) {
    markedDates[today] = {
      ...markedDates[today],
      customStyles: {
        container: {
          borderWidth: 2,
          borderColor: THEME,
          borderRadius: 8,
        },
        text: {
          color: '#2d4150',
          fontWeight: 'bold',
        },
      },
    };
  }

  const selectedEvents = events.filter(e => e.date === selectedDate);

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const EventModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedEvent && (
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <View style={styles.modalSection}>
                <View style={styles.modalRow}>
                  <CalendarIcon size={16} color={THEME} />
                  <Text style={styles.modalText}>
                    {format(new Date(selectedEvent.date), "MMMM d, yyyy")}
                  </Text>
                </View>
                
                <View style={styles.modalRow}>
                  <Clock size={16} color={THEME} />
                  <Text style={styles.modalText}>{selectedEvent.time}</Text>
                </View>
                
                <View style={styles.modalRow}>
                  <MapPin size={16} color={THEME} />
                  <Text style={styles.modalText}>{selectedEvent.location}</Text>
                </View>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSubtitle}>Description</Text>
                <Text style={styles.modalDescription}>
                  {selectedEvent.description || "No description available"}
                </Text>
              </View>
              
              <Divider style={styles.modalDivider} />
              
              <View style={styles.modalSection}>
                <Text style={styles.modalSubtitle}>Event Type</Text>
                <Chip 
                  style={[styles.typeChip, { backgroundColor: EVENT_COLORS[selectedEvent.type] || THEME }]}
                  textStyle={styles.typeChipText}
                >
                  {selectedEvent.type}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        )}
      </Modal>
    </Portal>
  );

  const renderCustomDay = ({ date, state, marking }) => {
    const hasEvents = eventsByDate[date.dateString]?.length > 0;
    const dayEvents = eventsByDate[date.dateString] || [];
    const isSelected = date.dateString === selectedDate;
    const isCurrentDay = date.dateString === today;
    
    return (
      <View style={[
        styles.customDayContainer,
        isSelected && styles.selectedDayContainer,
        isCurrentDay && !isSelected && styles.currentDayContainer,
      ]}>
        <Text style={[
          styles.customDayText,
          state === 'disabled' && styles.disabledDayText,
          isSelected && styles.selectedDayText,
          isCurrentDay && !isSelected && styles.currentDayText,
        ]}>
          {date.day}
        </Text>
        
        {hasEvents && (
          <View style={styles.eventPreviewContainer}>
            {dayEvents.slice(0, 2).map((event, index) => (
              <Text 
                key={index} 
                style={styles.eventPreviewText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                • {event.title}
              </Text>
            ))}
            {dayEvents.length > 2 && (
              <Text style={styles.moreEventsText}>
                +{dayEvents.length - 2} more
              </Text>
            )}
          </View>
        )}
        
        {hasEvents && (
          <View style={styles.dotContainer}>
            {dayEvents.slice(0, 3).map((event, index) => (
              <View
                key={index}
                style={[
                  styles.eventDot,
                  { backgroundColor: EVENT_COLORS[event.type] || THEME },
                  index > 0 && styles.eventDotSpacing,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <EventModal />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <Text style={styles.heading}>Lodge Calendar</Text>

        {/* Calendar */}
        <Card style={styles.calendarCard}>
          <Card.Content>
            <Calendar
              current={selectedMonth}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              onMonthChange={(month) => setSelectedMonth(month.dateString)}
              markedDates={markedDates}
              dayComponent={renderCustomDay}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: THEME,
                selectedDayTextColor: '#ffffff',
                todayTextColor: THEME,
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                dotColor: THEME,
                selectedDotColor: '#ffffff',
                arrowColor: THEME,
                monthTextColor: THEME,
                indicatorColor: THEME,
                textDayFontWeight: '300',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '300',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
              style={styles.calendar}
            />
            
            <View style={styles.legendContainer}>
              {Object.entries(EVENT_COLORS).map(([type, color]) => (
                <View key={type} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Agenda */}
        <View style={styles.agendaHeader}>
          <Text style={styles.section}>
            Agenda
          </Text>
          <Text style={styles.dateText}>
            {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
          </Text>
        </View>

        {selectedEvents.length > 0 ? (
          selectedEvents.map(event => {
            const StatusIcon = STATUS_CONFIG[event.myStatus]?.icon || Users;
            
            return (
              <Card
                key={event._id}
                style={[
                  styles.eventCard,
                  { borderLeftColor: EVENT_COLORS[event.type] || THEME },
                ]}
                onPress={() => handleEventPress(event)}
              >
                <Card.Content>
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTitleContainer}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      {isToday(new Date(event.date)) && (
                        <Chip style={styles.todayChip} textStyle={styles.todayChipText}>
                          Today
                        </Chip>
                      )}
                    </View>
                    {/* <Chip 
                      style={[styles.typeChip, { backgroundColor: EVENT_COLORS[event.type] || THEME }]}
                      textStyle={styles.typeChipText}
                    >
                      {event.type}
                    </Chip> */}
                  </View>

                  <View style={styles.eventDetails}>
                    <View style={styles.row}>
                      <Clock size={16} color="#666" />
                      <Text style={styles.detailText}>{event.time}</Text>
                    </View>

                    <View style={styles.row}>
                      <MapPin size={16} color="#666" />
                      <Text style={styles.detailText}>{event.location}</Text>
                    </View>
                  </View>

                  {event.myStatus && (
                    <View style={styles.statusContainer}>
                      <StatusIcon size={16} color={STATUS_CONFIG[event.myStatus]?.color} />
                      <Text style={[styles.statusText, { color: STATUS_CONFIG[event.myStatus]?.color }]}>
                        {STATUS_CONFIG[event.myStatus]?.label}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <CalendarIcon size={40} color="#ccc" />
              <Text style={styles.emptyText}>No events scheduled for this day</Text>
            </Card.Content>
          </Card>
        )}

        {/* History */}
        <View style={styles.historyHeader}>
          <Text style={styles.section}>Event History</Text>
          <Text style={styles.historyCount}>{events.length} total events</Text>
        </View>

        {events
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map(event => {
            const past = isPast(new Date(event.date));
            const StatusIcon = STATUS_CONFIG[event.myStatus]?.icon || Users;
            const isEventToday = isToday(new Date(event.date));
            const isEventTomorrow = isTomorrow(new Date(event.date));
            
            let dateLabel = format(new Date(event.date), "MMM d, yyyy");
            if (isEventToday) dateLabel = "Today";
            else if (isEventTomorrow) dateLabel = "Tomorrow";
            
            return (
              <Card
                key={event._id}
                style={[
                  styles.historyCard,
                  past && styles.pastEventCard,
                ]}
                onPress={() => handleEventPress(event)}
              >
                <Card.Content style={styles.historyContent}>
                  <View style={styles.historyMain}>
                    <View style={styles.historyLeft}>
                      <View style={[styles.eventTypeIndicator, { backgroundColor: EVENT_COLORS[event.type] || THEME }]} />
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyTitle}>
                          {event.title}
                        </Text>
                        <Text style={[
                          styles.historyDate,
                          isEventToday && styles.todayDate,
                          isEventTomorrow && styles.tomorrowDate,
                        ]}>
                          {dateLabel} · {event.time}
                        </Text>
                        
                        <View style={styles.stats}>
                          <Users size={14} color="#666" />
                          <Text style={styles.statsText}>
                            {event.stats?.attending ?? 0} ATTENDED ·{" "}
                            {event.stats?.maybe ?? 0} MAYBE ·{" "}
                            {event.stats?.notAttending ?? 0} NOT ATTENDED
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.statusBox}>
                      {event.myStatus && (
                        <>
                          <StatusIcon size={18} color={STATUS_CONFIG[event.myStatus]?.color} />
                          <Text style={[styles.statusLabel, { color: STATUS_CONFIG[event.myStatus]?.color }]}>
                            {STATUS_CONFIG[event.myStatus]?.label}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
      </ScrollView>
    </View>
  );
}

/* ---------------- Responsive Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heading: {
    fontSize: screenWidth < 400 ? 20 : 24,
    fontWeight: "700",
    margin: screenWidth < 400 ? 12 : 16,
    color: "#1a1a1a",
  },
  calendarCard: {
    marginHorizontal: screenWidth < 400 ? 12 : 16,
    marginBottom: screenWidth < 400 ? 15 : 20,
    elevation: 2,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  calendar: {
    borderRadius: 8,
  },
  customDayContainer: {
    width: screenWidth < 400 ? 32 : 36,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  selectedDayContainer: {
    backgroundColor: THEME,
    borderRadius: 8,
  },
  currentDayContainer: {
    borderWidth: 2,
    borderColor: THEME,
    borderRadius: 8,
  },
  customDayText: {
    fontSize: screenWidth < 400 ? 14 : 16,
    color: '#2d4150',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  currentDayText: {
    color: THEME,
    fontWeight: 'bold',
  },
  disabledDayText: {
    color: '#d9e1e8',
  },
  eventPreviewContainer: {
    width: '100%',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  eventPreviewText: {
    fontSize: screenWidth < 400 ? 7 : 8,
    color: THEME,
    fontWeight: '500',
  },
  moreEventsText: {
    fontSize: screenWidth < 400 ? 6 : 7,
    color: '#666',
    fontStyle: 'italic',
  },
  dotContainer: {
    flexDirection: 'row',
    marginTop: 2,
    justifyContent: 'center',
    
  },
  eventDot: {
    width: screenWidth < 400 ? 4 : 5,
    height: screenWidth < 400 ? 4 : 5,
    borderRadius: screenWidth < 400 ? 2 : 2.5,
  },
  eventDotSpacing: {
    marginLeft: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: screenWidth < 400 ? 12 : 16,
    marginBottom: 10,
  },
  section: {
    fontSize: screenWidth < 400 ? 16 : 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  dateText: {
    fontSize: screenWidth < 400 ? 12 : 13,
    color: "#666",
    fontWeight: "500",
  },
  eventCard: {
    marginHorizontal: screenWidth < 400 ? 12 : 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 1,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTitle: {
    fontWeight: "600",
    fontSize: screenWidth < 400 ? 14 : 15,
    color: "#1a1a1a",
    flexShrink: 1,
  },
  todayChip: {
    backgroundColor: THEME,
    height: 28,
  },
  todayChipText: {
    fontSize: 10,
    color: '#fff',
  },
  typeChip: {
    height: 34,
  },
  typeChipText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  eventDetails: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: screenWidth < 400 ? 12 : 13,
    color: "#666",
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
    backgroundColor: "#F8F9FA",
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyCard: {
    marginHorizontal: screenWidth < 400 ? 12 : 16,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: screenWidth < 400 ? 13 : 14,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: screenWidth < 400 ? 12 : 16,
    marginTop: 20,
    marginBottom: 10,
  },
  historyCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  historyCard: {
    marginHorizontal: screenWidth < 400 ? 12 : 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: "#F8F9FA",
  },
  pastEventCard: {
    opacity: 0.9,
  },
  historyContent: {
    paddingVertical: screenWidth < 400 ? 10 : 12,
  },
  historyMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontWeight: "600",
    fontSize: screenWidth < 400 ? 13 : 14,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  historyDate: {
    fontSize: screenWidth < 400 ? 11 : 12,
    color: "#666",
    marginBottom: 4,
  },
  todayDate: {
    color: THEME,
    fontWeight: '600',
  },
  tomorrowDate: {
    color: '#f9a825',
    fontWeight: '600',
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statsText: {
    fontSize: screenWidth < 400 ? 10 : 11,
    color: "#666",
  },
  statusBox: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 12,
    minWidth: 70,
  },
  statusLabel: {
    fontSize: screenWidth < 400 ? 10 : 11,
    fontWeight: "500",
    marginTop: 2,
  },
  
  // Modal Styles
  modalContainer: {
    margin: screenWidth < 400 ? 16 : 20,
    backgroundColor: 'transparent',
  },
  modalCard: {
    borderRadius: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: screenWidth < 400 ? 18 : 20,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
  },
  modalDivider: {
    marginVertical: 12,
  },
  modalSection: {
    marginVertical: 8,
  },
  modalSubtitle: {
    fontSize: screenWidth < 400 ? 14 : 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
  },
  modalText: {
    fontSize: screenWidth < 400 ? 13 : 14,
    color: '#666',
    flex: 1,
  },
  modalDescription: {
    fontSize: screenWidth < 400 ? 13 : 14,
    color: '#444',
    lineHeight: 20,
  },
});

export { EVENT_COLORS };