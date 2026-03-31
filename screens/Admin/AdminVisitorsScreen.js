import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Alert, FlatList } from "react-native";
import * as SecureStore from "expo-secure-store";
import Button from "../../components/Button";
import { API_URL } from '../../config';

const BASE_URL = `${API_URL}`;

// If your backend does NOT have /api/visitors/today, easiest: reuse /api/dashboard and read visitorsList.
const DASHBOARD_ENDPOINT = `${BASE_URL}/api/dashboard`;

// Exit endpoint in your backend is PATCH /api/visitors/exit (from your earlier setup)
const EXIT_ENDPOINT = `${BASE_URL}/api/visitors/exit`;

export default function AdminVisitorsScreen() {
  const [visitors, setVisitors] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchVisitors = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");

    const resp = await fetch(DASHBOARD_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) return Alert.alert("Error", data.message);

    // ✅ Only show active visitors
    const activeVisitors = (data.visitorsList ?? []).filter(
      (v) => !v.exit_time
    );

    setVisitors(activeVisitors);
  } catch {
    Alert.alert("Network error", "Could not connect to server");
  }
};

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleMarkLeft = async () => {
  if (!selectedId) return Alert.alert("Select a visitor", "Tap a visitor first");

  const selectedVisitor = visitors.find(v => v.id === selectedId);
  if (!selectedVisitor?.plate) {
    return Alert.alert("Error", "No plate found for this visitor");
  }

  setLoading(true);
  try {
    const token = await SecureStore.getItemAsync("token");

    const resp = await fetch(EXIT_ENDPOINT, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        plate: selectedVisitor.plate,
      }),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) return Alert.alert("Failed", data.message);

    Alert.alert("Success", "Marked as left");
    setSelectedId(null);
    fetchVisitors();
  } catch {
    Alert.alert("Network error", "Could not connect to server");
  } finally {
    setLoading(false);
  }
};

  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedId;
    const hasLeft = !!item.exit_time;

    return (
      <Pressable
        onPress={() => setSelectedId(item.id)}
        style={{
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isSelected ? "#85FF27" : "#ddd",
          backgroundColor: hasLeft ? "#f0f0f0" : "#fff",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontWeight: "700" }}>{item.name ?? "Unknown"}</Text>
        <Text>Cell: {item.phone ?? "-"}</Text>
        <Text>Plate: {item.plate ?? "-"}</Text>
        <Text>Status: {hasLeft ? "Left" : "Inside"}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={visitors.filter(v => !v.exit_time)} // ✅ only active
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 14 }}
      />

      <Button
        title={loading ? "Marking..." : "Mark Left"}
        onPress={handleMarkLeft}
      />
    </View>
  );
}