import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
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
import Header from "../../Components/layout/Header";
import { useNavigation, useRoute } from "@react-navigation/native";

// Sample messages data
const initialMessages = [
  { id: 1, text: "Brethren, remember the rehearsal tomorrow at 7 PM.", time: "10:30 AM", sender: "W. Bro. John", isOwn: false },
  { id: 2, text: "I'll be there. Do we need to bring anything?", time: "10:32 AM", sender: "You", isOwn: true },
  { id: 3, text: "Just your regalia. The Tyler will provide the rest.", time: "10:35 AM", sender: "W. Bro. Robert", isOwn: false },
  { id: 4, text: "Great! Looking forward to it.", time: "10:40 AM", sender: "You", isOwn: true },
  { id: 5, text: "Don't forget the charity committee meeting after rehearsal.", time: "10:45 AM", sender: "Bro. Michael", isOwn: false },
];

// Sample group members
const groupMembers = [
  { id: 1, name: "W. Bro. John Smith", role: "Worshipful Master" },
  { id: 2, name: "Bro. Robert Johnson", role: "Senior Warden" },
  { id: 3, name: "Bro. Michael Brown", role: "Junior Warden" },
  { id: 4, name: "Bro. David Wilson", role: "Treasurer" },
  { id: 5, name: "Bro. James Taylor", role: "Secretary" },
  { id: 6, name: "You", role: "Member" },
];

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { chat } = route.params || {};
  
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const scrollViewRef = useRef();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: "You",
        isOwn: true,
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const openMembersList = () => {
    navigation.navigate("GroupMembers", { members: groupMembers, chatName: chat?.name });
  };

  const openGroupInfo = () => {
    navigation.navigate("GroupInfo", { chat });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Header /> */}
      
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.chatInfo} onPress={openGroupInfo}>
          <Avatar.Text
            size={40}
            label={chat?.isGroup ? "G" : chat?.name?.charAt(0)}
            style={chat?.isGroup ? styles.groupAvatar : styles.userAvatar}
          />
          <View style={styles.chatTitleContainer}>
            <Text style={styles.chatTitle}>{chat?.name || "Group Chat"}</Text>
            <Text style={styles.memberStatus}>
              {chat?.isGroup ? `${groupMembers.length} members` : "Online"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <IconButton
            icon={() => <Phone color="#333" size={22} />}
            size={24}
            onPress={() => console.log("Call")}
          />
          <IconButton
            icon={() => <Video color="#333" size={22} />}
            size={24}
            onPress={() => console.log("Video")}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon={() => <MoreVertical color="#333" size={22} />}
                size={24}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                openMembersList();
              }} 
              title="View Members" 
              leadingIcon={() => <Users size={18} />}
            />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                console.log("Mute notifications");
              }} 
              title="Mute Notifications" 
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                console.log("Report group");
              }} 
              title="Report" 
              style={{ color: "#ff4444" }}
            />
          </Menu>
        </View>
      </View>

      {/* Messages Area */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>TODAY</Text>
          </View>

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isOwn ? styles.ownMessage : styles.otherMessage,
              ]}
            >
              {!message.isOwn && (
                <View style={styles.messageHeader}>
                  <Text style={styles.senderName}>{message.sender}</Text>
                </View>
              )}
              <View style={[
                styles.messageContent,
                message.isOwn ? styles.ownMessageContent : styles.otherMessageContent
              ]}>
                <Text style={[
                  styles.messageText,
                  message.isOwn ? styles.ownMessageText : styles.otherMessageText
                ]}>
                  {message.text}
                </Text>
                <View style={styles.messageFooter}>
                  <Text style={styles.messageTime}>{message.time}</Text>
                  {message.isOwn && (
                    <Check size={14} color="#4CAF50" style={styles.readIcon} />
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip color="#666" size={22} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaButton}>
            <ImageIcon color="#666" size={22} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
          
          {newMessage.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Send color="#fff" size={22} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.micButton}>
              <Mic color="#666" size={22} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
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