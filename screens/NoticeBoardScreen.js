import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Pressable,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function NoticeBoardScreen() {
  const { isDarkMode } = useTheme();

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  const BASE_URL = "http://192.168.43.215:3000";

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/announcements`);
      const json = await res.json();

      if (!json.success) return;

      setAnnouncements(
        json.announcements.map((a) => ({
          id: String(a.id),
          title: a.title,
          body: a.body,
          date: a.created_at,
          category: a.category || "General",
        }))
      );
    } catch (err) {
      console.warn("Failed to load announcements", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredAnnouncements = announcements.filter((item) =>
    (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.body || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryBg = (category) => {
    return category === "Security"
      ? "#ffeaa7"
      : category === "Maintenance"
      ? "#a29bfe"
      : category === "Meeting"
      ? "#fd79a8"
      : category === "Urgent"
      ? "#ff4a4a"
      : "#a0cfe4";
  };

  const AnnouncementCard = ({ item }) => (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryBg(item.category) },
          ]}
        >
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        <Text style={[styles.date, isDarkMode && styles.mutedTextDark]}>
          {formatDate(item.date)}
        </Text>
      </View>

      <Text style={[styles.title, isDarkMode && styles.textDark]}>
        {item.title}
      </Text>

      <Text style={[styles.body, isDarkMode && styles.mutedTextDark]}>
        {item.body}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {searchVisible && (
        <View
          style={[
            styles.searchContainer,
            isDarkMode && styles.searchContainerDark,
          ]}
        >
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
            placeholder="Search announcements..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={isDarkMode ? "#888" : "#666"}
            autoFocus={true}
          />

          <Pressable
            onPress={() => setSearchVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons
              name="close"
              size={24}
              color={isDarkMode ? "#bbb" : "#666"}
            />
          </Pressable>
        </View>
      )}

      <FlatList
        data={filteredAnnouncements}
        renderItem={({ item }) => <AnnouncementCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          isDarkMode && styles.listContainerDark,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={[styles.floatingButton, isDarkMode && styles.floatingButtonDark]}
        onPress={() => setSearchVisible(!searchVisible)}
      >
        <Ionicons
          name={searchVisible ? "close" : "search"}
          size={24}
          color="#000"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  containerDark: {
    backgroundColor: "#121212",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchContainerDark: {
    backgroundColor: "#1e1e1e",
    borderBottomColor: "#333",
  },

  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#111",
  },
  searchInputDark: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
  },

  closeButton: {
    marginLeft: 10,
    padding: 5,
  },

  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 80,
    backgroundColor: "#f5f5f5",
  },
  listContainerDark: {
    backgroundColor: "#121212",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    shadowOpacity: 0,
    elevation: 0,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },

  date: {
    fontSize: 14,
    color: "#666",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },

  body: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
  },

  textDark: {
    color: "#fff",
  },
  mutedTextDark: {
    color: "#bbb",
  },

  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#85FF27",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#c7c7c7",
  },
  floatingButtonDark: {
    borderColor: "#333",
  },
});