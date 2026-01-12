import React, { useState } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { ArrowLeft, Plus, Heart, Share, Download } from "lucide-react-native"; // ← Lucide icons

const images = [
  { id: 1, url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800", caption: "Installation Banquet 2025" },
  { id: 2, url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800", caption: "Charity Walk Team" },
  { id: 3, url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800", caption: "Ladies Night" },
  { id: 4, url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800", caption: "Festive Board" },
  { id: 5, url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800", caption: "Provincial Visit" },
  { id: 6, url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800", caption: "Summer BBQ" },
];

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width / 3 - 2;

export default function Gallery() {
  const [selected, setSelected] = useState(null);

  return (
    <View style={styles.container}>
      {/* Header - Fixed */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity>
            <ArrowLeft color="#333" size={22} />
          </TouchableOpacity>
          <Text variant="titleLarge" style={styles.heading}>
            Social Gallery
          </Text>
        </View>

        <Button
          mode="outlined"
          compact
          icon={() => <Plus color="#333" size={18} />}
          onPress={() => {}}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FlatList
          data={images}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          scrollEnabled={false} // Let ScrollView handle scrolling
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelected(item)}>
              <Image
                source={{ uri: item.url }}
                style={styles.image}
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* Modal Viewer */}
      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image
              source={{ uri: selected?.url }}
              style={styles.preview}
              resizeMode="contain"
            />

            <View style={styles.modalContent}>
              <View style={styles.captionRow}>
                <Text style={styles.caption}>{selected?.caption}</Text>

                <View style={styles.actions}>
                  <TouchableOpacity>
                    <Heart color="#c62828" size={22} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Share color="#333" size={22} />
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                mode="contained-tonal"
                icon={() => <Download color="#333" size={16} />}
                onPress={() => {}}
              >
                Download Original
              </Button>

              <Button
                mode="text"
                onPress={() => setSelected(null)}
              >
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heading: {
    fontWeight: "700",
  },
  scrollContent: {
    padding: 1,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  preview: {
    width: "100%",
    height: 400,
    backgroundColor: "#000",
  },
  modalContent: {
    padding: 16,
    gap: 12,
  },
  captionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caption: {
    fontWeight: "600",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
