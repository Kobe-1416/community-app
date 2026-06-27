import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Button from "../../components/Button";
import { API_URL, getItem } from "../../config";
import { useTheme } from "../../context/ThemeContext";
import { colors } from "../../styles/colors";

const BASE_URL = `${API_URL}`;
const LIST_ENDPOINT = `${BASE_URL}/api/announcements`;
const DELETE_ENDPOINT = (id) => `${BASE_URL}/api/announcements/${id}`;

export default function AdminAnnouncementsScreen() {
  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? colors.dark : colors.light;

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
      const token = await getItem("token");

      const resp = await fetch(LIST_ENDPOINT, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        return Alert.alert(
          "Error",
          data.message || "Failed to load announcements"
        );
      }

      const list =
        data.announcements ?? data.items ?? (Array.isArray(data) ? data : []);

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
    if (!selectedId) {
      return Alert.alert("Select an announcement", "Tap one first");
    }

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
              const token = await getItem("token");

              if (!token) {
                return Alert.alert("Error", "Not logged in");
              }

              const resp = await fetch(DELETE_ENDPOINT(selectedId), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              const data = await resp.json().catch(() => ({}));

              if (!resp.ok) {
                return Alert.alert(
                  "Failed",
                  data.message || "Could not delete"
                );
              }

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
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: isSelected ? colors.primary : themeColors.border,
          },
        ]}
      >
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={1}
        >
          {item.title ?? "Untitled"}
        </Text>

        {!!item.body && (
          <Text
            style={[styles.body, { color: themeColors.mutedText }]}
            numberOfLines={3}
          >
            {item.body}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text
            style={[styles.metaText, { color: themeColors.mutedText }]}
            numberOfLines={1}
          >
            By: {item.created_by ?? item.user_id ?? "-"}
          </Text>

          <Text
            style={[styles.metaText, { color: themeColors.mutedText }]}
            numberOfLines={1}
          >
            {formatDate(item.created_at)}
          </Text>
        </View>

        {isSelected && (
          <Text style={[styles.selectedHint, { color: colors.primary }]}>
            Selected
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
    >
      <View style={styles.topRow}>
        <Text style={[styles.header, { color: themeColors.text }]}>
          Admin Announcements
        </Text>
      </View>

      {loadingList ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.mutedText }]}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: themeColors.mutedText }}>
                No announcements yet.
              </Text>
            </View>
          }
          onRefresh={fetchAnnouncements}
          refreshing={loadingList}
        />
      )}

      <View style={styles.bottomBar}>
        <Button title="Refresh" onPress={fetchAnnouncements} />
        <View style={{ height: 10 }} />
        <Button
          title={deleting ? "Deleting..." : "Delete Selected"}
          onPress={handleDelete}
        />
      </View>

      {!!selected && (
        <View
          style={[
            styles.selectionBar,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text
            style={[styles.selectionText, { color: themeColors.text }]}
            numberOfLines={1}
          >
            Selected: {selected.title ?? "Untitled"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  header: {
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },

  title: {
    fontWeight: "800",
    marginBottom: 6,
  },

  body: {
    lineHeight: 20,
  },

  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  metaText: {
    fontSize: 12,
    flex: 1,
    marginRight: 10,
  },

  selectedHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
  },

  bottomBar: {
    paddingTop: 8,
  },

  selectionBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 140,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },

  selectionText: {
    fontSize: 12,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 8,
  },
});