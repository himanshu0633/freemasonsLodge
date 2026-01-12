import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Card, Button, Chip } from "react-native-paper";
import { FileText, Download, Upload } from "lucide-react-native"; // ← Lucide icons
import Header from "../../Components/layout/Header";

const documents = [
  { id: 1, title: "January 2026 Summons", type: "summons", date: "Jan 03, 2026", size: "1.2 MB" },
  { id: 2, title: "Minutes - Dec 2025", type: "lodge", date: "Dec 18, 2025", size: "840 KB" },
  { id: 3, title: "Provincial Charity Report", type: "region", date: "Dec 10, 2025", size: "2.4 MB" },
  { id: 4, title: "Book of Constitutions Update", type: "grand", date: "Nov 22, 2025", size: "5.1 MB" },
  { id: 5, title: "December 2025 Summons", type: "summons", date: "Dec 01, 2025", size: "1.1 MB" },
];

const typeColors = {
  summons: "#c62828",
  lodge: "#616161",
  region: "#1a237e",
  grand: "#4a148c",
};

const typeLabels = {
  summons: "Summons",
  lodge: "Lodge",
  region: "Region",
  grand: "Grand Lodge",
};

export default function Documents() {
  const [tab, setTab] = useState("all");

  const filteredDocs =
    tab === "all" ? documents : documents.filter(d => d.type === tab);

  return (
    <View style={styles.container}>
      <Header />

      {/* Header & Tabs */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.heading}>
            Documents
          </Text>
          <Button
            mode="outlined"
            compact
            onPress={() => {}}
            icon={() => <Upload color="#333" size={18} />}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabs}
        >
          {["all", "summons", "lodge", "region", "grand"].map((t) => (
            <Chip
              key={t}
              selected={tab === t}
              onPress={() => setTab(t)}
              style={styles.tabChip}
            >
              {t === "all" ? "All" : typeLabels[t]}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Document List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredDocs.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </ScrollView>
    </View>
  );
}

function DocumentCard({ doc }) {
  return (
    <Card style={[styles.card, { borderLeftColor: typeColors[doc.type] }]}>
      <Card.Content style={styles.cardContent}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: typeColors[doc.type] + "22" },
          ]}
        >
          <FileText size={22} color={typeColors[doc.type]} />
        </View>

        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.title}>
            {doc.title}
          </Text>

          <View style={styles.meta}>
            <Chip compact style={{ backgroundColor: typeColors[doc.type] }}>
              <Text style={styles.chipText}>{typeLabels[doc.type]}</Text>
            </Chip>
            <Text style={styles.date}>• {doc.date}</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Download size={20} color="#666" />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heading: {
    fontWeight: "700",
  },
  tabs: {
    marginBottom: 8,
  },
  tabChip: {
    marginRight: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  chipText: {
    fontSize: 10,
    color: "#fff",
  },
  date: {
    fontSize: 11,
    opacity: 0.6,
    marginLeft: 6,
  },
});
