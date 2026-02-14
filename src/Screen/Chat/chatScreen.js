import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  Text,
  Avatar,
  TextInput,
  IconButton,
  Menu,
  Divider,
} from "react-native-paper";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Image as ImageIcon,
  Send,
  Users,
  Paperclip,
  Mic,
  Check,
} from "lucide-react-native";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { getMessages, sendMessage } from "../../chatapi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../Components/layout/Header";

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chat } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  const scrollViewRef = useRef();
  const isFocused = useIsFocused();

  /** Load logged-in user */
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("userData");
        if (stored) {
          setUserId(JSON.parse(stored)._id);
        }
      } catch {
        Alert.alert("Error", "Failed to load user");
      }
    })();
  }, [isFocused]);

  /** Load messages */
  useEffect(() => {
    if (!chat?._id || !userId) return;

    (async () => {
      try {
        const res = await getMessages(chat._id);

        const normalized = (res?.data || []).map(msg => ({
          _id: msg._id,
          text: msg.text,
          isOwn: msg.sender?._id === userId,
          senderName: msg.sender
            ? `${msg.sender.firstName} ${msg.sender.lastName}`.trim()
            : "Unknown",
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setMessages(normalized);
      } catch {
        Alert.alert("Error", "Failed to load messages");
      }
    })();
  }, [chat?._id, userId]);

  /** Auto-scroll */
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  /** Send message */
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const res = await sendMessage({
        chatId: chat._id,
        senderId: userId,
        text: newMessage,
      });

      const msg = res.data;

      setMessages(prev => [
        ...prev,
        {
          _id: msg._id,
          text: msg.text,
          isOwn: true,
          senderName: "You",
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setNewMessage("");
    } catch {
      Alert.alert("Error", "Failed to send message");
    }
  };

  const openMembersList = () => {
    navigation.navigate("GroupInfo", { chat });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <Header /> */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatInfo} onPress={openMembersList}>
          <Avatar.Text size={40} label={chat?.name?.[0] || "G"} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.chatTitle}>{chat?.name}</Text>
            <Text style={styles.memberStatus}>
              {chat?.members?.length || 0} members
            </Text>
          </View>
        </TouchableOpacity>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon={() => <MoreVertical size={22} />}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={openMembersList}
            title="View Members"
            leadingIcon={() => <Users size={18} />}
          />
          <Divider />
          <Menu.Item title="Report" />
        </Menu>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
        >
          {messages.map(message => (
            <View
              key={message._id}
              style={[
                styles.messageBubble,
                message.isOwn ? styles.ownMessage : styles.otherMessage,
              ]}
            >
              {!message.isOwn && (
                <Text style={styles.senderName}>
                  {message.senderName}
                </Text>
              )}

              <View
                style={[
                  styles.messageContent,
                  message.isOwn
                    ? styles.ownMessageContent
                    : styles.otherMessageContent,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isOwn && { color: "#fff" },
                  ]}
                >
                  {message.text}
                </Text>

                <View style={styles.messageFooter}>
                  <Text style={styles.messageTime}>{message.time}</Text>
                  {message.isOwn && <Check size={14} color="#4CAF50" />}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
          >
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* styles unchanged (same as yours) */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: "10%",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  chatTitleContainer: {
    marginLeft: 12,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberStatus: {
    fontSize: 12,
    color: "#666",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  groupAvatar: {
    backgroundColor: "#e3f2fd",
  },
  userAvatar: {
    backgroundColor: "#eeeeee",
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageBubble: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  messageHeader: {
    marginBottom: 4,
    marginLeft: 8,
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  messageContent: {
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  ownMessageContent: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherMessageContent: {
    backgroundColor: "#E8E8E8",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
  },
  ownMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#000",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    marginRight: 4,
  },
  ownMessageTime: {
    color: "rgba(255,255,255,0.8)",
  },
  otherMessageTime: {
    color: "#999",
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  mediaButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
});