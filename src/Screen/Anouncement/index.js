import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Badge } from "react-native-paper";
import {
  File,
  Clock,
  ChevronRight,
  Search,
  ArrowLeft,
  X,
} from "lucide-react-native";
import axiosInstance from "../../axiosInstance";
import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import Header from "../../Components/layout/Header";

export default function AllAnnouncements() {
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const categories = ["All", "General", "Notice", "Urgent"];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/announcements/all");
      const data = Array.isArray(res.data) ? res.data : [];
      setAnnouncements(data);
      setFilteredAnnouncements(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAnnouncements();
  }, [searchQuery, selectedCategory, announcements]);

  const filterAnnouncements = () => {
    let filtered = announcements;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.type === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAnnouncements(filtered);
  };

  const getCategoryColor = (category) => {
    const colors = {
      General: "#2563EB",
      Notice: "#CA8A04",
      Urgent: "#DC2626",
    };
    return colors[category] || "#6B7280";
  };

  const getCategoryBgColor = (category) => {
    const colors = {
      General: "#EFF6FF",
      Notice: "#FEF9E7",
      Urgent: "#FEF2F2",
    };
    return colors[category] || "#F3F4F6";
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMM yyyy • h:mm a");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Announcements</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search announcements"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
              {selectedCategory === category && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.centerText}>Loading announcements...</Text>
          </View>
        ) : filteredAnnouncements.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.centerText}>No announcements found</Text>
          </View>
        ) : (
          filteredAnnouncements.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => setSelectedAnnouncement(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: getCategoryBgColor(item.type) },
                ]}
              >
                <File size={22} color={getCategoryColor(item.type)} />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text numberOfLines={1} style={styles.title}>
                    {item.title}
                  </Text>
                  <Badge 
                    style={[
                      styles.badge,
                      { backgroundColor: getCategoryColor(item.type) }
                    ]}
                  >
                    {item.type}
                  </Badge>
                </View>

                <Text numberOfLines={2} style={styles.desc}>
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
              
              <ChevronRight size={18} color="#D1D5DB" style={styles.chevron} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={!!selectedAnnouncement}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSelectedAnnouncement(null)}
              >
                <X size={22} color="#111" />
              </TouchableOpacity>
            </View>

            {selectedAnnouncement && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>
                  {selectedAnnouncement.title}
                </Text>

                <Badge
                  style={[
                    styles.modalBadge,
                    { backgroundColor: getCategoryColor(selectedAnnouncement.type) }
                  ]}
                >
                  {selectedAnnouncement.type}
                </Badge>

                <View style={styles.modalDateContainer}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.modalDate}>
                    {formatDate(selectedAnnouncement.createdAt)}
                  </Text>
                </View>

                <View style={styles.modalDivider} />

                <Text style={styles.modalDesc}>
                  {selectedAnnouncement.description}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F9FAFB" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    // paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700",
    color: "#111",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 15,
    color: "#111",
    padding: 0,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    marginRight: 10,
    position: "relative",
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipActive: { 
    backgroundColor: "#FFF",
    borderColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: { 
    fontSize: 14, 
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryTextActive: { 
    color: "#DC2626",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -1,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: "#DC2626",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  list: { 
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  centerText: { 
    textAlign: "center", 
    color: "#9CA3AF",
    fontSize: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8,
    marginBottom: 6,
  },
  title: { 
    fontSize: 16, 
    fontWeight: "600",
    color: "#111",
    flex: 1,
  },
  badge: {
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  desc: { 
    fontSize: 13, 
    color: "#6B7280", 
    marginBottom: 8,
    lineHeight: 18,
  },
  cardFooter: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
  },
  date: { 
    fontSize: 11, 
    color: "#9CA3AF",
    fontWeight: "500",
  },
  chevron: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  modalClose: {
    padding: 4,
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 12,
    color: "#111",
    lineHeight: 28,
  },
  modalBadge: {
    alignSelf: "flex-start",
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  modalDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  modalDate: { 
    fontSize: 13, 
    color: "#6B7280",
    fontWeight: "500",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 16,
  },
  modalDesc: { 
    fontSize: 15, 
    lineHeight: 24, 
    color: "#374151",
    marginBottom: 20,
  },
});