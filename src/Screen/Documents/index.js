import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
  StatusBar,
  Image,
  RefreshControl,
} from "react-native";
import { Text, Card, Chip } from "react-native-paper";
import { 
  FileText, 
  Download, 
  Upload, 
  X, 
  Edit3, 
  Trash2, 
  File,
  Image as ImageIcon,
  FilePlus,
  Calendar,
  FileWarning,
  CheckCircle
} from "lucide-react-native";
import * as DocumentPicker from "@react-native-documents/picker";
import Header from "../../Components/layout/Header";
import axiosInstance from "../../axiosInstance";
import API_URL from "../../api";

const typeColors = {
  summons: "#2563eb",
  lodge: "#7c3aed",
  region: "#0891b2",
  grand: "#b45309",
};

const typeLabels = {
  summons: "Summons",
  lodge: "Lodge",
  region: "Region",
  grand: "Grand Lodge",
};

const typeIcons = {
  summons: FileWarning,
  lodge: FileText,
  region: File,
  grand: CheckCircle,
};

export default function Documents() {
  // ALL HOOKS MUST BE AT TOP LEVEL, NO CONDITIONS
  const [tab, setTab] = useState("all");
  const [documents, setDocuments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("summons");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setApiError(false);
      const res = await axiosInstance.get("/documents");
      setDocuments(res.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setApiError(true);
      Alert.alert("Error", "Failed to fetch documents. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  // Pick File
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.xls,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.ppt,
          DocumentPicker.types.pptx,
        ],
        allowMultiSelection: false,
      });

      if (result?.length) {
        const selectedFile = result[0];
        setFile({
          uri: selectedFile.uri,
          type: selectedFile.type || "application/octet-stream",
          name: selectedFile.name || "document",
          size: selectedFile.size || 0,
        });
      }
    } catch (error) {
      if (error?.code === "DOCUMENT_PICKER_CANCELED") return;
      console.error("Picker error:", error);
      Alert.alert("Error", "File selection failed. Please try again.");
    }
  };

  // Create Document
  const createDocument = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!file && !editingDocument) {
      Alert.alert("Error", "Please select a file");
      return;
    }

    try {
      setUploadLoading(true);
      
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("documentType", documentType);
      formData.append("description", description.trim());

      if (file) {
        formData.append("file", {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      }

      let response;
      if (editingDocument) {
        response = await axiosInstance.put(`/documents/update/${editingDocument._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        });
      } else {
        response = await axiosInstance.post("/documents/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        });
      }

      if (response.data) {
        Alert.alert("Success", editingDocument 
          ? "Document updated successfully" 
          : "Document uploaded successfully"
        );
        resetForm();
        fetchDocuments();
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = editingDocument 
        ? "Update failed. Please try again." 
        : "Upload failed. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again with a smaller file.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete Document
  const deleteDocument = (documentId) => {
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleteLoading(true);
              await axiosInstance.delete(`/documents/${documentId}`);
              Alert.alert("Success", "Document deleted successfully");
              fetchDocuments();
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete document. Please try again.");
            } finally {
              setDeleteLoading(false);
            }
          },
        },
      ]
    );
  };

  // Edit Document
  const editDocument = (doc) => {
    setEditingDocument(doc);
    setTitle(doc.title);
    setDocumentType(doc.documentType);
    setDescription(doc.description || "");
    setFile(null);
    setModalVisible(true);
  };

  // Reset Form
  const resetForm = () => {
    setModalVisible(false);
    setTitle("");
    setDescription("");
    setFile(null);
    setDocumentType("summons");
    setUploadLoading(false);
    setEditingDocument(null);
  };

  // Download File
  const downloadFile = (filename) => {
    if (!filename) {
      Alert.alert("Error", "File not found");
      return;
    }
    const url = `${API_URL}/uploads/documents/${filename}`;
    Linking.openURL(url).catch(err => {
      console.error("Download error:", err);
      Alert.alert("Error", "Cannot open file. Please check your internet connection.");
    });
  };

  // Get File Icon - Helper function, not a hook
  const getFileIcon = (fileType, fileName) => {
    if (fileType?.includes("image") || fileName?.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return ImageIcon;
    }
    if (fileType?.includes("pdf") || fileName?.endsWith('.pdf')) {
      return FileText;
    }
    return File;
  };

  // Format File Size - Helper function, not a hook
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Render Document Preview - No hooks inside
  const renderDocumentPreview = (doc) => {
    if (!doc.file) return null;
    
    const fullUrl = `${API_URL}/uploads/documents/${doc.file}`;
    const isImage = doc.fileType?.includes("image") || 
                   doc.file?.match(/\.(jpg|jpeg|png|gif)$/i);
    
    if (isImage) {
      return (
        <TouchableOpacity 
          style={styles.imagePreviewContainer}
          onPress={() => setPreviewImage(fullUrl)}
          activeOpacity={0.9}
        >
          <Image 
            source={{uri: fullUrl}} 
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageOverlayText}>Tap to view</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      const FileIcon = getFileIcon(doc.fileType, doc.file);
      return (
        <TouchableOpacity 
          style={styles.filePreviewContainer}
          onPress={() => downloadFile(doc.file)}
          activeOpacity={0.7}
        >
          <View style={styles.fileIconContainer}>
            <FileIcon size={32} color={typeColors[doc.documentType] || "#64748b"} />
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {doc.file.split('/').pop() || 'Document'}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(doc.fileSize)} • Tap to download
            </Text>
          </View>
          <Download size={20} color="#64748b" />
        </TouchableOpacity>
      );
    }
  };

  const filteredDocs = tab === "all" 
    ? documents 
    : documents.filter((d) => d.documentType === tab);

  // DON'T call React.createElement conditionally or inside render functions that might re-order hooks
  // Just use the icon directly in JSX

  return (
    <View style={styles.container}>
      {/* <StatusBar backgroundColor="#0f172a" barStyle="light-content" /> */}
      <Header />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Documents</Text>
            <Text style={styles.headerSubtitle}>
              {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'} available
            </Text>
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => {
              resetForm();
              setModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Upload color="#fff" size={20} />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContent}
        >
          {["all", "summons", "lodge", "region", "grand"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tab, tab === t && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "all" ? "All" : typeLabels[t]}
              </Text>
              {tab === t && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Documents List */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : apiError ? (
          <View style={styles.centerContent}>
            <FileWarning size={48} color="#ef4444" />
            <Text style={styles.errorText}>Network Error</Text>
            <Text style={styles.errorSubtext}>Failed to load documents</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchDocuments}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredDocs.length === 0 ? (
          <View style={styles.centerContent}>
            <FilePlus size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No documents found</Text>
            <Text style={styles.emptySubtext}>
              {tab === "all" 
                ? "Upload your first document to get started" 
                : `No ${typeLabels[tab]} documents available`}
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            >
              <Text style={styles.emptyButtonText}>Upload Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDocs.map((doc, index) => {
            const DocTypeIcon = typeIcons[doc.documentType] || FileText;
            return (
              <Card key={doc._id} style={[styles.card, index === 0 && styles.firstCard]}>
                <Card.Content style={styles.cardContent}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.typeIconContainer, { backgroundColor: `${typeColors[doc.documentType]}15` }]}>
                        <DocTypeIcon size={20} color={typeColors[doc.documentType]} />
                      </View>
                      <View style={styles.cardTitleContainer}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {doc.title}
                        </Text>
                        <View style={styles.cardMeta}>
                          <Chip 
                            style={[styles.typeChip, { backgroundColor: typeColors[doc.documentType] }]}
                            textStyle={styles.typeChipText}
                          >
                            {typeLabels[doc.documentType] || doc.documentType}
                          </Chip>
                          <View style={styles.dateContainer}>
                            <Calendar size={12} color="#64748b" />
                            <Text style={styles.dateText}>
                              {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : ""}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => editDocument(doc)}
                        activeOpacity={0.7}
                      >
                        <Edit3 size={16} color="#2563eb" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => deleteDocument(doc._id)}
                        disabled={deleteLoading}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Description */}
                  {doc.description ? (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                      {doc.description}
                    </Text>
                  ) : null}

                  {/* Document Preview */}
                  {renderDocumentPreview(doc)}
                </Card.Content>
              </Card>
            );
          })
        )}
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal 
        visible={!!previewImage} 
        transparent={true} 
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.previewModalOverlay}>
          <View style={styles.previewModalHeader}>
            <TouchableOpacity 
              style={styles.previewCloseButton}
              onPress={() => setPreviewImage(null)}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.previewDownloadButton}
              onPress={() => {
                const filename = previewImage?.split('/').pop();
                if (filename) downloadFile(filename);
              }}
            >
              <Download size={20} color="#fff" />
              <Text style={styles.previewDownloadText}>Download</Text>
            </TouchableOpacity>
          </View>
          {previewImage && (
            <Image 
              source={{uri: previewImage}} 
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Upload/Edit Modal */}
      <Modal 
        visible={modalVisible} 
        transparent={true} 
        animationType="slide" 
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalIcon, { backgroundColor: `${typeColors[documentType]}15` }]}>
                  {React.createElement(typeIcons[documentType] || FileText, {
                    size: 24,
                    color: typeColors[documentType]
                  })}
                </View>
                <Text style={styles.modalTitle}>
                  {editingDocument ? 'Edit Document' : 'Upload Document'}
                </Text>
              </View>
              <TouchableOpacity onPress={resetForm} style={styles.modalCloseButton}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                {/* Title Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Title <Text style={styles.requiredStar}>*</Text></Text>
                  <TextInput 
                    placeholder="Enter document title" 
                    style={styles.input} 
                    value={title} 
                    onChangeText={setTitle}
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* Document Type Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Document Type</Text>
                  <View style={styles.typeGrid}>
                    {["summons", "lodge", "region", "grand"].map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setDocumentType(type)}
                        style={[
                          styles.typeCard,
                          documentType === type && styles.typeCardActive,
                          { borderColor: typeColors[type] }
                        ]}
                        activeOpacity={0.7}
                      >
                        {React.createElement(typeIcons[type], {
                          size: 24,
                          color: documentType === type ? '#fff' : typeColors[type]
                        })}
                        <Text 
                          style={[
                            styles.typeCardText,
                            documentType === type && styles.typeCardTextActive
                          ]}
                        >
                          {typeLabels[type]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Description Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description (Optional)</Text>
                  <TextInput 
                    placeholder="Enter document description" 
                    style={[styles.input, styles.textArea]} 
                    value={description} 
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                {/* File Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    File {!editingDocument && <Text style={styles.requiredStar}>*</Text>}
                    {editingDocument && <Text style={styles.optionalText}> (Optional)</Text>}
                  </Text>
                  <TouchableOpacity 
                    onPress={pickFile} 
                    style={[
                      styles.filePicker,
                      file && styles.filePickerSelected
                    ]}
                    activeOpacity={0.7}
                  >
                    <Upload size={20} color={file ? "#2563eb" : "#64748b"} />
                    <Text 
                      style={[
                        styles.filePickerText, 
                        file && styles.filePickerTextSelected
                      ]}
                      numberOfLines={1}
                    >
                      {file ? file.name : "Choose a file"}
                    </Text>
                    {file && (
                      <TouchableOpacity 
                        onPress={() => setFile(null)}
                        style={styles.removeFileButton}
                      >
                        <X size={16} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                  {editingDocument && !file && (
                    <Text style={styles.fileHelpText}>
                      Leave empty to keep current file
                    </Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={resetForm}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.saveButton,
                      uploadLoading && styles.saveButtonDisabled,
                      { backgroundColor: typeColors[documentType] }
                    ]} 
                    onPress={createDocument}
                    disabled={uploadLoading}
                    activeOpacity={0.8}
                  >
                    {uploadLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Upload size={18} color="#fff" />
                        <Text style={styles.saveButtonText}>
                          {editingDocument ? 'Update' : 'Upload'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8fafc" 
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingTop: 16,
    paddingBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tabContainer: {
    flexGrow: 0,
  },
  tabContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 4,
    borderRadius: 20,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: "#eff6ff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  tabTextActive: {
    color: "#2563eb",
    fontWeight: "600",
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -8,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 12,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  firstCard: {
    marginTop: 0,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeChip: {
    height: 34,
    borderRadius: 6,
  },
  typeChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  deleteButton: {
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
    lineHeight: 20,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  imagePreview: {
    width: '100%',
    height: 180,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  filePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#64748b',
  },
  bottomSpacing: {
    height: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#ef4444',
  },
  optionalText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#64748b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  typeCardActive: {
    backgroundColor: '#2563eb',
  },
  typeCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a',
  },
  typeCardTextActive: {
    color: '#fff',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderStyle: 'dashed',
  },
  filePickerSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    borderStyle: 'solid',
  },
  filePickerText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
  },
  filePickerTextSelected: {
    color: '#2563eb',
    fontWeight: '500',
  },
  removeFileButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileHelpText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Preview Modal Styles
  previewModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  previewCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  previewDownloadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
});