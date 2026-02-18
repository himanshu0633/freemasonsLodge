import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal as RNModal,
  SafeAreaView,
} from "react-native";
import {
  Text,
  Avatar,
  TextInput,
  Button,
  Card,
  Chip,
  ActivityIndicator,
} from "react-native-paper";
import { Plus, Search, X, Users, Check } from "lucide-react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../Components/layout/Header";
import * as chatapi from "../../chatapi";

// Theme color
const SCARLET_RED = "#DC143C";
const LIGHT_SCARLET = "#FFE4E8";

export default function Chat() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]); // Initialize as empty array
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  /** ---------------- LOAD USER ---------------- */
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("userData");
        if (stored) {
          const user = JSON.parse(stored);
          setUserId(user._id);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    })();
  }, []);

  /** ---------------- LOAD GROUPS ---------------- */
  const loadGroups = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const res = await chatapi.getAllGroups(userId);
      // Ensure we always set an array
      setGroups(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading groups:", error);
      setGroups([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isFocused && userId) {
      loadGroups();
    }
  }, [isFocused, userId, loadGroups]);

  /** ---------------- LOAD USERS ---------------- */
  useEffect(() => {
    if (!modalVisible) return;
    
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await chatapi.getAllUsers();
        // Filter out current user and ensure we have an array
        const allUsers = Array.isArray(res?.data) ? res.data : [];
        setUsers(allUsers.filter(u => u && u._id !== userId));
      } catch (error) {
        console.error("Error loading users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    loadUsers();
  }, [modalVisible, userId]);

  /** ---------------- CREATE GROUP ---------------- */
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    try {
      setCreatingGroup(true);
      await chatapi.createGroup({
        name: groupName.trim(),
        members: [...selectedUsers, userId],
        userId,
      });

      // Reset form
      setGroupName("");
      setSelectedUsers([]);
      setModalVisible(false);
      setDropdownVisible(false);
      
      // Reload groups
      await loadGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setCreatingGroup(false);
    }
  };

  /** ---------------- TOGGLE USER SELECTION ---------------- */
  const toggleUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  /** ---------------- REMOVE SELECTED USER ---------------- */
  const removeUser = (userId) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  // Safely filter groups - ensure groups is an array
  const filteredGroups = Array.isArray(groups) 
    ? groups.filter(g => 
        g && g.name && g.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const getUserById = (id) => {
    return Array.isArray(users) ? users.find(u => u && u._id === id) : null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="titleLarge" style={styles.heading}>
            Messages
          </Text>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={22} color={SCARLET_RED} />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Search conversations..."
          value={search}
          onChangeText={setSearch}
          left={<TextInput.Icon icon={() => <Search size={18} color="#666" />} />}
          mode="outlined"
          dense
          outlineColor="#ddd"
          activeOutlineColor={SCARLET_RED}
          style={styles.searchInput}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={SCARLET_RED} />
            <Text style={styles.loaderText}>Loading conversations...</Text>
          </View>
        ) : (
          <>
            {filteredGroups.length > 0 ? (
              filteredGroups.map(chat => (
                <TouchableOpacity
                  key={chat._id}
                  style={styles.chatCard}
                  onPress={() => navigation.navigate("ChatScreen", { chat })}
                >
                  <Card mode="elevated" style={styles.chatCardInner}>
                    <View style={styles.chatRow}>
                      <Avatar.Text
                        size={52}
                        label={chat.name?.[0]?.toUpperCase() || "G"}
                        style={[styles.groupAvatar, { backgroundColor: LIGHT_SCARLET }]}
                        color={SCARLET_RED}
                      />
                      <View style={styles.chatContent}>
                        <Text style={styles.chatName}>{chat.name}</Text>
                        <Text style={styles.message} numberOfLines={1}>
                          {chat.lastMessage || "No messages yet"}
                        </Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Users size={48} color="#ccc" />
                <Text style={styles.emptyText}>No conversations yet</Text>
                <Button
                  mode="contained"
                  onPress={() => setModalVisible(true)}
                  buttonColor={SCARLET_RED}
                  style={styles.emptyBtn}
                >
                  Start a chat
                </Button>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ---------------- CUSTOM MODAL ---------------- */}
      <RNModal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setDropdownVisible(false);
          setSelectedUsers([]);
          setGroupName("");
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={styles.modalTitle}>
                Create New Group
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setDropdownVisible(false);
                  setSelectedUsers([]);
                  setGroupName("");
                }}
                style={styles.closeBtn}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Group Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Group Name</Text>
                <TextInput
                  value={groupName}
                  onChangeText={setGroupName}
                  mode="outlined"
                  placeholder="Enter group name"
                  outlineColor="#ddd"
                  activeOutlineColor={SCARLET_RED}
                  style={styles.input}
                />
              </View>

              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <View style={styles.selectedUsersContainer}>
                  <Text style={styles.label}>Selected Members ({selectedUsers.length})</Text>
                  <View style={styles.chipContainer}>
                    {selectedUsers.map(id => {
                      const user = getUserById(id);
                      return user ? (
                        <Chip
                          key={id}
                          onClose={() => removeUser(id)}
                          style={styles.chip}
                          textStyle={styles.chipText}
                          closeIconColor={SCARLET_RED}
                        >
                          {user.name}
                        </Chip>
                      ) : null;
                    })}
                  </View>
                </View>
              )}

              {/* Member Selection Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Add Members</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                  <Text style={styles.dropdownTriggerText}>
                    {selectedUsers.length === 0 
                      ? "Select members..." 
                      : `${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''} selected`}
                  </Text>
                  <Users size={20} color="#666" />
                </TouchableOpacity>

                {dropdownVisible && (
                  <Card style={styles.dropdownMenu}>
                    {loadingUsers ? (
                      <View style={styles.dropdownLoader}>
                        <ActivityIndicator size="small" color={SCARLET_RED} />
                        <Text style={styles.dropdownLoaderText}>Loading users...</Text>
                      </View>
                    ) : (
                      <ScrollView 
                        style={styles.dropdownList}
                        nestedScrollEnabled={true}
                      >
                        {Array.isArray(users) && users.length > 0 ? (
                          users.map(user => (
                            <TouchableOpacity
                              key={user._id}
                              style={styles.userItem}
                              onPress={() => toggleUser(user._id)}
                            >
                              <View style={styles.userInfo}>
                                <Avatar.Text
                                  size={36}
                                  label={user.name?.[0]?.toUpperCase() || "U"}
                                  style={[styles.userAvatar, { backgroundColor: LIGHT_SCARLET }]}
                                  color={SCARLET_RED}
                                />
                                <Text style={styles.userName}>{user.name}</Text>
                              </View>
                              {selectedUsers.includes(user._id) && (
                                <Check size={20} color={SCARLET_RED} />
                              )}
                            </TouchableOpacity>
                          ))
                        ) : (
                          <Text style={styles.noUsersText}>No users available</Text>
                        )}
                      </ScrollView>
                    )}
                  </Card>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <Button
                mode="outlined"
                onPress={() => {
                  setModalVisible(false);
                  setDropdownVisible(false);
                  setSelectedUsers([]);
                  setGroupName("");
                }}
                style={styles.footerBtn}
                textColor="#666"
                borderColor="#ddd"
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateGroup}
                style={[styles.footerBtn, styles.createBtn]}
                buttonColor={SCARLET_RED}
                loading={creatingGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0 || creatingGroup}
              >
                Create Group
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </RNModal>
    </SafeAreaView>
  );
}

/** ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  heading: {
    fontWeight: "700",
    color: "#333",
  },
  addBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: LIGHT_SCARLET,
  },
  searchInput: {
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  chatCard: {
    marginBottom: 8,
  },
  chatCardInner: {
    borderRadius: 12,
    elevation: 2,
  },
  chatRow: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  groupAvatar: {
    borderRadius: 26,
  },
  chatContent: {
    marginLeft: 12,
    flex: 1,
  },
  chatName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
    marginBottom: 16,
  },
  emptyBtn: {
    borderRadius: 24,
    paddingHorizontal: 24,
  },

  /** MODAL STYLES */
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontWeight: "700",
    color: "#333",
  },
  closeBtn: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
  },
  selectedUsersContainer: {
    marginBottom: 20,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: LIGHT_SCARLET,
    borderRadius: 20,
  },
  chipText: {
    color: SCARLET_RED,
    fontSize: 13,
  },
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  dropdownTriggerText: {
    color: "#333",
    fontSize: 14,
  },
  dropdownMenu: {
    marginTop: 8,
    maxHeight: 300,
    elevation: 4,
    borderRadius: 8,
  },
  dropdownList: {
    padding: 8,
  },
  dropdownLoader: {
    padding: 20,
    alignItems: "center",
  },
  dropdownLoaderText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    marginRight: 12,
    borderRadius: 18,
  },
  userName: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  noUsersText: {
    textAlign: "center",
    padding: 20,
    color: "#999",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 8,
  },
  footerBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 24,
  },
  createBtn: {
    elevation: 0,
  },
});