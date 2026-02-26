// screens/admin/AdminMarketplaceScreen.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import Button from "../../components/Button";

const BASE_URL = "http://192.168.43.215:3000";
const LIST_ENDPOINT = `${BASE_URL}/api/market/items`;
// Assumed delete: DELETE /api/market/items/:id
const DELETE_ENDPOINT = (id) => `${BASE_URL}/api/market/items/${id}`;

export default function AdminMarketplaceScreen() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedItem = useMemo(
    () => items.find((x) => String(x.id) === String(selectedId)),
    [items, selectedId]
  );

  const fetchItems = async () => {
    setLoadingList(true);
    try {
      // If your LIST endpoint is public, you can remove token logic.
      const token = await SecureStore.getItemAsync("token");

      const resp = await fetch(LIST_ENDPOINT, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) return Alert.alert("Error", data.message || "Failed to load marketplace items");

      // Your marketplace currently returns { items: [...] }
      setItems(data.items ?? []);
    } catch {
      Alert.alert("Network error", "Could not connect to server");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return Alert.alert("Select an item", "Tap a listing first");

    Alert.alert(
      "Delete listing?",
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
              if (!resp.ok) return Alert.alert("Failed", data.message || "Could not delete item");

              Alert.alert("Deleted", "Listing removed");
              setSelectedId(null);
              fetchItems();
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

  const formatPrice = (price) => {
    const n = Number(price);
    if (Number.isNaN(n)) return String(price ?? "");
    return `R${n.toLocaleString()}`;
  };

  const renderItem = ({ item }) => {
    const id = String(item.id);
    const isSelected = id === String(selectedId);

    return (
      <Pressable
        onPress={() => setSelectedId(id)}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>
            {item.prod_name ?? "Untitled"}
          </Text>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>

        {!!item.prod_desc && (
          <Text style={styles.desc} numberOfLines={2}>
            {item.prod_desc}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaText} numberOfLines={1}>
            Seller: {item.user_id ?? "-"}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            Cell: {item.cell_no ?? "-"}
          </Text>
        </View>

        {isSelected && <Text style={styles.selectedHint}>Selected</Text>}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Marketplace</Text>

      {loadingList ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text>No marketplace items found.</Text>
            </View>
          }
          onRefresh={fetchItems}
          refreshing={loadingList}
        />
      )}

      <View style={styles.bottomBar}>
        <Button title="Refresh" onPress={fetchItems} />
        <View style={{ height: 10 }} />
        <Button
          title={deleting ? "Deleting..." : "Delete Selected"}
          onPress={handleDelete}
        />
      </View>

      {!!selectedItem && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText} numberOfLines={1}>
            Selected: {selectedItem.prod_name ?? "Untitled"} ({formatPrice(selectedItem.price)})
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "700", marginBottom: 12 },

  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: "#85FF27",
  },

  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontWeight: "700", flex: 1, marginRight: 10 },
  price: { fontWeight: "800", color: "#2b2b2b" },

  desc: { marginTop: 6, color: "#666" },

  metaRow: { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  metaText: { color: "#777", fontSize: 12, flex: 1, marginRight: 10 },

  selectedHint: { marginTop: 8, fontSize: 12, fontWeight: "700", color: "#2b2b2b" },

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