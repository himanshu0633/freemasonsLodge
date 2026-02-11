import React, { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Avatar, TextInput, Badge } from "react-native-paper";
import { Plus, Search } from "lucide-react-native"; // ← Lucide icons
import Header from "../../Components/layout/Header";
import { useNavigation } from "@react-navigation/native";

const chats = [
  { id: 1, name: "Lodge Harmony 341", lastMessage: "Brethren, remember the rehearsal tomorrow.", time: "10:30 AM", unread: 3, isGroup: true },
  { id: 2, name: "W. Bro. James Smith", lastMessage: "Can you confirm the dining numbers?", time: "Yesterday", unread: 0, isGroup: false },
  { id: 3, name: "Charity Committee", lastMessage: "The raffle prizes are sorted.", time: "Tuesday", unread: 0, isGroup: true },
  { id: 4, name: "Bro. David Wilson", lastMessage: "Thanks for the lift!", time: "Monday", unread: 0, isGroup: false },
];

export default function Chat() {
  const [search, setSearch] = useState("");
    const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <Header />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.heading}>
            Messages
          </Text>

          <TouchableOpacity style={styles.addBtn}>
            <Plus color="#333" size={22} /> {/* ← Lucide Plus */}
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Search conversations..."
          value={search}
          onChangeText={setSearch}
          left={<TextInput.Icon icon={() => <Search color="#333" size={20} />} />}
          mode="outlined"
          dense
        />
      </View>

      {/* Chat List */}
      <ScrollView>
        {chats.map((chat) => (
          <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')} key={chat.id} style={styles.chatRow}>
            <Avatar.Text
              size={48}
              label={chat.isGroup ? "G" : chat.name.charAt(0)}
              style={chat.isGroup ? styles.groupAvatar : styles.userAvatar}
            />

            <View style={styles.chatContent}>
              <View style={styles.chatHeader}>
                <Text numberOfLines={1} style={styles.chatName}>
                  {chat.name}
                </Text>
                <Text style={styles.time}>{chat.time}</Text>
              </View>

              <Text numberOfLines={1} style={styles.message}>
                {chat.lastMessage}
              </Text>
            </View>

            {chat.unread > 0 && (
              <Badge style={styles.badge}>{chat.unread}</Badge>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heading: {
    fontWeight: "700",
  },
  addBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  groupAvatar: {
    backgroundColor: "#e3f2fd",
  },
  userAvatar: {
    backgroundColor: "#eeeeee",
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatName: {
    fontWeight: "600",
    flex: 1,
  },
  time: {
    fontSize: 10,
    opacity: 0.6,
    marginLeft: 8,
  },
  message: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  badge: {
    marginLeft: 8,
  },
});
