import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Text,
  Avatar,
  TextInput,
  Modal,
  Button,
  Chip,
  Searchbar,
  Card,
} from "react-native-paper";
import { Plus, Users, MessageCircle } from "lucide-react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MultiSelect from "react-native-multiple-select";
import Header from "../../Components/layout/Header";
import * as chatapi from "../../chatapi";

export default function Chat() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load user data
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("userData");
        if (!stored) {
          console.log("No user data found");
          return;
        }
        const user = JSON.parse(stored);
        setUserId(user._id);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    })();
  }, []);

  // Load groups
  const loadGroups = useCallback(async () => {
    if (!userId) {
      console.log("No userId available yet");
      return;
    }
    
    try {
      setLoading(true);
      console.log("Loading groups for userId:", userId);
      // ✅ Fix: Use correct function name
      const response = await chatapi.getAllGroups(userId);
      console.log("Groups response:", response);
      
      // Handle different response structures
      const groupsData = response?.data || response || [];
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (error) {
      console.error("Error loading groups:", error);
      Alert.alert("Error", "Failed to load groups. Please try again.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isFocused && userId) {
      loadGroups();
    }
  }, [isFocused, userId, loadGroups]);

  // Load users for group creation
  useEffect(() => {
    if (!modalVisible || !userId) return;
    
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        console.log("Loading all users...");
        const response = await chatapi.getAllUsers();
        console.log("Users response:", response);
        
        // Handle different response structures
        const usersData = response?.data || response || [];
        
        // Ensure usersData is an array
        if (!Array.isArray(usersData)) {
          console.error("Users data is not an array:", usersData);
          setUsers([]);
          return;
        }

        // Filter out current user and format users
        const formattedUsers = usersData
          .filter(user => user && user._id !== userId)
          .map(user => ({
            ...user,
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          }));
        
        console.log("Formatted users:", formattedUsers);
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        Alert.alert("Error", "Failed to load users. Please try again.");
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    loadUsers();
  }, [modalVisible, userId]);

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) {
      Alert.alert("Error", "Please enter a group name and select members");
      return;
    }

    try {
      setLoading(true);
      console.log("Creating group with:", {
        name: groupName,
        members: [...selectedUsers, userId],
        userId,
      });

      const response = await chatapi.createGroup({
        name: groupName,
        members: [...selectedUsers, userId],
        userId,
      });

      console.log("Create group response:", response);

      setGroupName("");
      setSelectedUsers([]);
      setModalVisible(false);
      
      // Reload groups after successful creation
      await loadGroups();
      
      Alert.alert("Success", "Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Error", "Failed to create group. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return "G";
    return name
      .split(' ')
      .map(word => word?.[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <MessageCircle size={24} color="#2196F3" />
            <Text variant="headlineMedium" style={styles.heading}>
              Messages
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        <Searchbar
          placeholder="Search conversations..."
          onChangeText={setSearch}
          value={search}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        ) : (
          <>
            {filteredGroups.map(chat => (
              <TouchableOpacity
                key={chat?._id || Math.random().toString()}
                style={styles.chatRow}
                onPress={() => navigation.navigate("ChatScreen", { chat })}
              >
                <Avatar.Text
                  size={52}
                  label={getInitials(chat?.name)}
                  style={styles.groupAvatar}
                  labelStyle={styles.avatarLabel}
                />
                <View style={styles.chatContent}>
                  <Text style={styles.chatName}>{chat?.name || "Unnamed Group"}</Text>
                  <Text style={styles.message} numberOfLines={1}>
                    {chat?.lastMessage || "No messages yet"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {filteredGroups.length === 0 && !loading && (
              <Card style={styles.emptyCard}>
                <Card.Content style={styles.emptyContent}>
                  <Users size={48} color="#ccc" />
                  <Text style={styles.emptyTitle}>No conversations yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Tap the + button to start a new group chat
                  </Text>
                </Card.Content>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalWrapper}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.modal}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Create New Group
            </Text>

            <TextInput
              label="Group Name"
              value={groupName}
              onChangeText={setGroupName}
              mode="outlined"
              style={styles.input}
              outlineColor="#ddd"
              activeOutlineColor="#2196F3"
            />

            <Text style={styles.sectionLabel}>Select Members</Text>
            
            {loadingUsers ? (
              <View style={styles.loadingUsers}>
                <ActivityIndicator size="small" color="#2196F3" />
              </View>
            ) : (
              <>
                {users.length > 0 ? (
                  <MultiSelect
                    items={users}
                    uniqueKey="_id"
                    displayKey="fullName"
                    selectedItems={selectedUsers}
                    onSelectedItemsChange={setSelectedUsers}
                    selectText="Pick members..."
                    searchInputPlaceholderText="Search users..."
                    tagRemoveIconColor="#ccc"
                    tagBorderColor="#ccc"
                    tagTextColor="#000"
                    selectedItemTextColor="#2196F3"
                    selectedItemIconColor="#2196F3"
                    itemTextColor="#000"
                    searchInputStyle={styles.searchInput}
                    submitButtonColor="#2196F3"
                    submitButtonText="Done"
                    styleMainWrapper={styles.multiSelectMain}
                    styleDropdownMenuSubsection={styles.multiSelectDropdown}
                    styleSelectorContainer={styles.selectorContainer}
                    styleTextDropdown={styles.dropdownText}
                    styleIndicator={styles.indicator}
                  />
                ) : (
                  <Text style={styles.noUsersText}>No users available</Text>
                )}

                {selectedUsers.length > 0 && (
                  <View style={styles.selectedContainer}>
                    <Text style={styles.selectedLabel}>
                      Selected ({selectedUsers.length}):
                    </Text>
                    <View style={styles.chipContainer}>
                      {selectedUsers.map(id => {
                        const user = users.find(u => u?._id === id);
                        return user ? (
                          <Chip
                            key={id}
                            onClose={() => setSelectedUsers(prev => 
                              prev.filter(uid => uid !== id)
                            )}
                            style={styles.chip}
                            textStyle={styles.chipText}
                          >
                            {user.fullName}
                          </Chip>
                        ) : null;
                      })}
                    </View>
                  </View>
                )}
              </>
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
                labelStyle={styles.cancelBtnLabel}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateGroup}
                style={styles.createBtn}
                labelStyle={styles.createBtnLabel}
                disabled={!groupName || selectedUsers.length === 0 || loading}
                loading={loading}
              >
                Create Group
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heading: {
    fontWeight: "700",
    color: '#333',
  },
  addBtn: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: "#e3f2fd",
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  chatRow: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  groupAvatar: {
    backgroundColor: "#e3f2fd",
  },
  avatarLabel: {
    fontSize: 18,
    color: '#2196F3',
  },
  chatContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  chatName: {
    fontWeight: "600",
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    color: '#666',
  },
  emptyCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modalWrapper: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardView: {
    width: '100%',
  },
  modal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "700",
    color: '#333',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  loadingUsers: {
    padding: 20,
    alignItems: 'center',
  },
  multiSelectMain: {
    marginBottom: 16,
  },
  multiSelectDropdown: {
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectorContainer: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  indicator: {
    marginRight: 8,
  },
  selectedContainer: {
    marginTop: 16,
  },
  selectedLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    color: '#2196F3',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderColor: '#ddd',
  },
  cancelBtnLabel: {
    color: '#666',
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  createBtnLabel: {
    color: '#fff',
  },
  noUsersText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});