import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Card, Text, Chip } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { Clock, MapPin } from "lucide-react-native"; // ← Lucide icons
import { format } from "date-fns";
import Header from "../../Components/layout/Header";

const events = [
  { date: "2026-01-15", title: "Regular Meeting", type: "meeting", time: "6:30 PM", location: "Lodge Room 1" },
  { date: "2026-01-22", title: "Rehearsal", type: "degree", time: "7:00 PM", location: "Lodge Room 2" },
  { date: "2026-01-29", title: "Lodge of Instruction", type: "mentoring", time: "7:30 PM", location: "Committee Room" },
  { date: "2026-02-05", title: "Officers Meeting", type: "admin", time: "6:00 PM", location: "Zoom" },
];

const eventColors = {
  meeting: "#c62828",
  degree: "#f9a825",
  mentoring: "#2e7d32",
  admin: "#1a237e",
};

export default function CalendarPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today);

  const markedDates = events.reduce((acc, e) => {
    acc[e.date] = { marked: true, dotColor: eventColors[e.type] };
    return acc;
  }, {
    [selectedDate]: { selected: true, selectedColor: "#6200ee" }
  });

  const selectedEvents = events.filter(e => e.date === selectedDate);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <Text variant="titleLarge" style={styles.heading}>
        Lodge Calendar
      </Text>

      {/* Calendar */}
      <Card style={styles.calendarCard}>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
        />
      </Card>

      {/* Agenda */}
      <Text variant="titleMedium" style={styles.agenda}>
        Agenda{" "}
        <Text style={styles.date}>
          {format(new Date(selectedDate), "MMM d, yyyy")}
        </Text>
      </Text>

      {selectedEvents.length > 0 ? (
        selectedEvents.map((event, idx) => (
          <Card
            key={idx}
            style={[styles.eventCard, { borderLeftColor: eventColors[event.type] }]}
          >
            <Card.Content>
              <View style={styles.header}>
                <Text variant="titleSmall">{event.title}</Text>
                <Chip compact>
                  {event.type}
                </Chip>
              </View>

              <View style={styles.row}>
                <Clock color="#333" size={16} />  {/* ← Lucide Clock */}
                <Text>{event.time}</Text>
              </View>

              <View style={styles.row}>
                <MapPin color="#333" size={16} /> {/* ← Lucide MapPin */}
                <Text>{event.location}</Text>
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={{ opacity: 0.6 }}>
            No events scheduled for this day.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
  },
  heading: {
    fontWeight: "700",
    marginBottom: 16,
  },
  calendarCard: {
    marginBottom: 20,
  },
  agenda: {
    fontWeight: "600",
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  eventCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
  },
});
