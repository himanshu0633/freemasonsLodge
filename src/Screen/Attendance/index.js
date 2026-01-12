import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Card,
  Text,
  Button,
  Chip,
} from "react-native-paper";
import { CheckCircle, Clock } from "lucide-react-native"; // ← Lucide icons
import Header from "../../Components/layout/Header";

const workingOfficers = [
  { role: "Worshipful Master", name: "W.Bro. James Smith", status: "confirmed" },
  { role: "Senior Warden", name: "Bro. Thomas Anderson", status: "confirmed" },
  { role: "Junior Warden", name: "Bro. Robert Brown", status: "pending" },
  { role: "Chaplain", name: "W.Bro. Peter Wilson", status: "confirmed" },
  { role: "Treasurer", name: "W.Bro. Michael Jones", status: "confirmed" },
  { role: "Secretary", name: "W.Bro. David Clark", status: "confirmed" },
];

export default function Attendance() {
  const [tab, setTab] = useState("officers");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />

      <Text variant="titleLarge" style={styles.heading}>
        Attendance & Working
      </Text>

      {/* User Status */}
      <Card style={styles.statusCard}>
        <Card.Title title="Your Status" />
        <Card.Content>
          <Text variant="bodyMedium">Next Meeting: Jan 15</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Response required
          </Text>

          <View style={styles.row}>
            <Button mode="contained" compact>
              Attending
            </Button>
            <Button mode="outlined" compact>
              Apology
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.subHeading}>
        Working Officers
      </Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Chip
          selected={tab === "officers"}
          onPress={() => setTab("officers")}
        >
          Regular Officers
        </Chip>
        <Chip
          selected={tab === "extra"}
          onPress={() => setTab("extra")}
        >
          Additional Work
        </Chip>
      </View>

      {tab === "officers" ? (
        workingOfficers.map((officer, index) => (
          <Card key={index} style={styles.officerCard}>
            <Card.Content style={styles.officerRow}>
              <View>
                <Text variant="labelSmall" style={styles.role}>
                  {officer.role}
                </Text>
                <Text variant="bodyMedium">{officer.name}</Text>
              </View>

              {officer.status === "confirmed" ? (
                <CheckCircle color="#2e7d32" size={22} />
              ) : (
                <Clock color="#f9a825" size={22} />
              )}
            </Card.Content>
          </Card>
        ))
      ) : (
        <View style={styles.empty}>
          <Text variant="bodyMedium" style={{ opacity: 0.6 }}>
            No additional work assigned yet.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  heading: {
    fontWeight: "700",
    marginBottom: 16,
  },
  subHeading: {
    marginVertical: 12,
    fontWeight: "600",
  },
  statusCard: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  tabs: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  officerCard: {
    marginBottom: 10,
  },
  officerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  role: {
    textTransform: "uppercase",
    fontWeight: "700",
    opacity: 0.7,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
  },
});
