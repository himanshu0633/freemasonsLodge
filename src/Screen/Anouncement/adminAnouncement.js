// AdminAnnouncementDashboard.js
import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import {
  Card,
  Text,
  Button,
  IconButton,
  ActivityIndicator,
  Divider,
  Portal,
  Dialog,
  Chip,
} from "react-native-paper";
import { Plus, Edit, Trash2, X, AlertCircle } from "lucide-react-native";
import Header from "../../Components/layout/Header";
import axiosInstance from "../../axiosInstance";

const THEME = "#C21807";
const THEME_LIGHT = "#FFE4E1";

export default function AdminAnnouncementDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "General",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/announcements/all");
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch {
      Alert.alert("Error", "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  const createAnnouncement = async () => {
    try {
      setLoading(true);
      await axiosInstance.post("/announcements/create", formData);
      closeModal();
      fetchAnnouncements();
      Alert.alert("Success", "Announcement created");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const updateAnnouncement = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(
        `/announcements/${selectedAnnouncement._id}`,
        formData
      );
      closeModal();
      fetchAnnouncements();
      Alert.alert("Success", "Announcement updated");
    } catch {
      Alert.alert("Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item) => {
    setAnnouncementToDelete(item);
    setDeleteDialogVisible(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(
        `/announcements/${announcementToDelete._id}`
      );
      setDeleteDialogVisible(false);
      setAnnouncementToDelete(null);
      fetchAnnouncements();
      Alert.alert("Success", "Announcement deleted");
    } catch {
      Alert.alert("Error", "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (item) => {
    setSelectedAnnouncement(item);
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
    });
    setModalType("edit");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAnnouncement(null);
    setFormData({ title: "", description: "", type: "General" });
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME]}
          />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Announcements</Text>

            <Button
              mode="contained"
              buttonColor={THEME}
              icon={() => <Plus size={18} color="#fff" />}
              onPress={() => {
                setModalType("create");
                setModalVisible(true);
              }}
            >
              Create
            </Button>
          </View>

          {/* List */}
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color={THEME} style={styles.loader} />
          ) : announcements.length === 0 ? (
            <View style={styles.emptyBox}>
              <AlertCircle size={40} color="#999" />
              <Text style={styles.emptyText}>No announcements found</Text>
            </View>
          ) : (
            announcements.map((item) => (
              <AnnouncementCard
                key={item._id}
                item={item}
                onEdit={openEdit}
                onDelete={confirmDelete}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Modal - Using native Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === "create" ? "Create Announcement" : "Edit Announcement"}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Title"
              value={formData.title}
              onChangeText={(t) => setFormData({ ...formData, title: t })}
              style={styles.input}
              placeholderTextColor="#999"
            />

            <TextInput
              placeholder="Description"
              value={formData.description}
              onChangeText={(t) =>
                setFormData({ ...formData, description: t })
              }
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />

            <Text style={styles.typeLabel}>Type</Text>
            <View style={styles.typeRow}>
              {["General", "Urgent", "Notice"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFormData({ ...formData, type })}
                  style={[
                    styles.typeChip,
                    formData.type === type && styles.typeChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      formData.type === type && styles.typeChipTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={closeModal}
                style={styles.modalButton}
                textColor="#666"
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                buttonColor={THEME}
                onPress={
                  modalType === "create" ? createAnnouncement : updateAnnouncement
                }
                loading={loading}
                style={styles.modalButton}
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Announcement</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete "{announcementToDelete?.title}"?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleDelete} textColor={THEME}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const AnnouncementCard = ({ item, onEdit, onDelete }) => (
  <Card style={styles.card}>
    <Card.Content>
      <View style={styles.cardHeader}>
        <Text variant="titleMedium" style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.cardActions}>
          <IconButton
            icon={() => <Edit size={18} color={THEME} />}
            onPress={() => onEdit(item)}
            size={24}
          />
          <IconButton
            icon={() => <Trash2 size={18} color={THEME} />}
            onPress={() => onDelete(item)}
            size={24}
          />
        </View>
      </View>

      <View style={styles.typeContainer}>
        <View style={[styles.cardTypeChip, 
          item.type === 'Urgent' && styles.urgentChip,
          item.type === 'Notice' && styles.noticeChip,
          item.type === 'General' && styles.generalChip,
        ]}>
          <Text style={[
            styles.cardTypeText,
            item.type === 'Urgent' && styles.urgentText,
            item.type === 'Notice' && styles.noticeText,
            item.type === 'General' && styles.generalText,
          ]}>{item.type}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA" 
  },
  content: { 
    padding: 16 
  },
  loader: {
    marginTop: 20
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold",
    color: "#333"
  },
  card: { 
    marginBottom: 12, 
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
  },
  typeContainer: {
    marginBottom: 8,
  },
  cardTypeChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  urgentChip: {
    backgroundColor: "#FFE4E1",
  },
  noticeChip: {
    backgroundColor: "#E3F2FD",
  },
  generalChip: {
    backgroundColor: "#E8F5E9",
  },
  cardTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  urgentText: {
    color: "#C21807",
  },
  noticeText: {
    color: "#1976D2",
  },
  generalText: {
    color: "#388E3C",
  },
  description: { 
    color: "#666",
    lineHeight: 20,
  },
  emptyBox: { 
    alignItems: "center", 
    marginTop: 40 
  },
  emptyText: { 
    marginTop: 10, 
    color: "#666",
    fontSize: 16
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: "bold",
    color: "#333"
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  typeChipSelected: {
    backgroundColor: THEME_LIGHT,
    borderColor: THEME,
  },
  typeChipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  typeChipTextSelected: {
    color: THEME,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    minWidth: 100,
  },
});

export { AdminAnnouncementDashboard };