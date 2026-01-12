import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Card, Button, TextInput } from "react-native-paper";
import * as Lucide from "lucide-react-native"; // Lucide React Native
import Header from "../../Components/layout/Header";

export default function Payments() {
  const [customAmount, setCustomAmount] = useState("");

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <Header />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Title */}
        <Text style={styles.pageTitle}>Payments</Text>

        {/* Outstanding Dues */}
        <Card style={[styles.card, styles.dueCard]}>
          <Card.Content>
            <Text style={styles.cardLabel}>Annual Subscription 2026</Text>

            <View style={styles.amountRow}>
              <Text style={styles.amount}>$150.00</Text>
              <Text style={styles.overdue}>Overdue</Text>
            </View>

            <Button mode="contained" style={styles.payButton} icon="credit-card">
              Pay via Card
            </Button>
          </Card.Content>
        </Card>

        {/* Charity Donation */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lucide.Heart size={18} color="#8B0000" />
            <Text style={styles.sectionTitle}>Charity Donation</Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.helperText}>
                Make a one-off donation to the Master's List.
              </Text>

              <View style={styles.amountGrid}>
                {["10", "20", "50"].map((amt) => (
                  <Button key={amt} mode="outlined" style={styles.amountBtn}>
                    ${amt}
                  </Button>
                ))}
              </View>

              <TextInput
                label="Other amount"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
                left={<TextInput.Icon icon="currency-usd" />}
                style={styles.input}
              />

              <Button mode="contained" style={styles.donateButton}>
                Donate
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lucide.History size={18} />
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>

          {[
            { label: "Dining Fee - Dec Meeting", date: "Dec 15, 2025", amount: "$35.00" },
            { label: "Charity - Almoner's Fund", date: "Nov 20, 2025", amount: "$50.00" },
            { label: "Raffle Tickets", date: "Nov 20, 2025", amount: "$10.00" },
          ].map((tx, idx) => (
            <View key={idx} style={styles.txRow}>
              <View>
                <Text style={styles.txLabel}>{tx.label}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={styles.txAmount}>{tx.amount}</Text>
            </View>
          ))}

          <View style={styles.viewAll}>
            <Text style={styles.viewAllText}>View All History</Text>
            <Lucide.ChevronRight size={16} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flex: 1,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    marginBottom: 20,
  },

  dueCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#B00020",
  },

  cardLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  amount: {
    fontSize: 28,
    fontWeight: "700",
  },

  overdue: {
    fontSize: 12,
    color: "#B00020",
    fontWeight: "600",
  },

  payButton: {
    marginTop: 10,
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  helperText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },

  amountGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  amountBtn: {
    flex: 1,
  },

  input: {
    marginBottom: 14,
  },

  donateButton: {
    backgroundColor: "#C9A227",
  },

  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    marginBottom: 8,
  },

  txLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  txDate: {
    fontSize: 11,
    color: "#777",
  },

  txAmount: {
    fontFamily: "monospace",
    fontWeight: "600",
  },

  viewAll: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },

  viewAllText: {
    fontSize: 12,
    color: "#777",
  },
});
