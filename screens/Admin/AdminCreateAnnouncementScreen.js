// screens/admin/AdminCreateAnnouncementScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, Pressable } from "react-native";
import * as SecureStore from "expo-secure-store";
import Button from "../../components/Button";

const BASE_URL = "http://192.168.43.215:3000";
const CREATE_ENDPOINT = `${BASE_URL}/api/announcements`;

export default function AdminCreateAnnouncementScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general"); // default
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !body.trim()) {
      return Alert.alert("Missing info", "Title and message are required.");
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "Not logged in");

      const resp = await fetch(CREATE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          category, // <-- send to backend
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok)
        return Alert.alert("Failed", data.message || "Could not create announcement");

      Alert.alert("Success", "Announcement posted");
      setTitle("");
      setBody("");
      setCategory("general");

      if (navigation?.goBack) navigation.goBack();
    } catch {
      Alert.alert("Network error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Announcement</Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={styles.input}
        maxLength={80}
      />

      {/* CATEGORY SELECTOR */}
      <View style={styles.categoryRow}>
        <Pressable
          style={[
            styles.categoryBtn,
            category === "general" && styles.categorySelected,
          ]}
          onPress={() => setCategory("general")}
        >
          <Text
            style={[
              styles.categoryText,
              category === "general" && styles.categoryTextSelected,
            ]}
          >
            General
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.categoryBtn,
            category === "urgent" && styles.urgentSelected,
          ]}
          onPress={() => setCategory("urgent")}
        >
          <Text
            style={[
              styles.categoryText,
              category === "urgent" && styles.categoryTextSelected,
            ]}
          >
            Urgent
          </Text>
        </Pressable>
      </View>

      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Message"
        style={[styles.input, styles.textArea]}
        multiline
      />

      <Button
        title={loading ? "Posting..." : "Post Announcement"}
        onPress={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },

  textArea: { minHeight: 140, textAlignVertical: "top" },

  categoryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  categoryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },

  categorySelected: {
    backgroundColor: "#eaeaea",
    borderColor: "#999",
  },

  urgentSelected: {
    backgroundColor: "#ffe5e5",
    borderColor: "#ff4d4d",
  },

  categoryText: {
    fontWeight: "600",
    color: "#333",
  },

  categoryTextSelected: {
    fontWeight: "800",
  },
});