// screens/admin/AdminAnnouncementsScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import Button from "../../components/Button";

const BASE_URL = "http://192.168.43.215:3000";
const LIST_ENDPOINT = `${BASE_URL}/api/announcements`; // GET
// Assumed delete: DELETE /api/announcements/:id
const DELETE_ENDPOINT = (id) => `${BASE_URL}/api/announcements/${id}`;

export default function AdminAnnouncementsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selected = useMemo(
    () => announcements.find((a) => String(a.id) === String(selectedId)),
    [announcements, selectedId]
  );

  const fetchAnnouncements = async () => {
    setLoadingList(true);
    try {
      const token = await SecureStore.getItemAsync("token");

      const resp = await fetch(LIST_ENDPOINT, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) return Alert.alert("Error", data.message || "Failed to load announcements");

      // Expect either { announcements: [...] } or { items: [...] } or raw []
      const list = data.announcements ?? data.items ?? (Array.isArray(data) ? data : []);
      setAnnouncements(list);
    } catch {
      Alert.alert("Network error", "Could not connect to server");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return Alert.alert("Select an announcement", "Tap one first");

    Alert.alert(
      "Delete announcement?",
      "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              const token = await SecureStore.getItemAsync("token");
              if (!token) return Alert.alert("Error", "Not logged in");

              const resp = await fetch(DELETE_ENDPOINT(selectedId), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              const data = await resp.json().catch(() => ({}));
              if (!resp.ok) return Alert.alert("Failed", data.message || "Could not delete");

              Alert.alert("Deleted", "Announcement removed");
              setSelectedId(null);
              fetchAnnouncements();
            } catch {
              Alert.alert("Network error", "Could not connect to server");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  };

  const renderItem = ({ item }) => {
    const id = String(item.id);
    const isSelected = id === String(selectedId);

    return (
      <Pressable
        onPress={() => setSelectedId(id)}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <Text style={styles.title} numberOfLines={1}>
          {item.title ?? "Untitled"}
        </Text>

        {!!item.body && (
          <Text style={styles.body} numberOfLines={3}>
            {item.body}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>By: {item.created_by ?? item.user_id ?? "-"}</Text>
          <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
        </View>

        {isSelected && <Text style={styles.selectedHint}>Selected</Text>}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.header}>Admin Announcements</Text>
        
      </View>

      {loadingList ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text>No announcements yet.</Text>
            </View>
          }
          onRefresh={fetchAnnouncements}
          refreshing={loadingList}
        />
      )}

      <View style={styles.bottomBar}>
        <Button title="Refresh" onPress={fetchAnnouncements} />
        <View style={{ height: 10 }} />
        <Button title={deleting ? "Deleting..." : "Delete Selected"} onPress={handleDelete} />
      </View>

      {!!selected && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText} numberOfLines={1}>
            Selected: {selected.title ?? "Untitled"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  header: { fontSize: 18, fontWeight: "700" },

  createBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
  },
  createBtnText: { fontWeight: "700" },

  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  cardSelected: { borderColor: "#85FF27" },

  title: { fontWeight: "800", marginBottom: 6 },
  body: { color: "#666" },

  metaRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  metaText: { color: "#777", fontSize: 12, flex: 1, marginRight: 10 },

  selectedHint: { marginTop: 8, fontSize: 12, fontWeight: "700" },

  bottomBar: { paddingTop: 8 },

  selectionBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 140,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f3f3f3",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  selectionText: { fontSize: 12, fontWeight: "600" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});