import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Button from "../../components/Button";
import { API_URL, getItem } from "../../config";
import { useTheme } from "../../context/ThemeContext";
import { colors } from "../../styles/colors";

const BASE_URL = `${API_URL}`;
const LIST_ENDPOINT = `${BASE_URL}/api/market/items`;
const DELETE_ENDPOINT = (id) => `${BASE_URL}/api/market/items/${id}`;

export default function AdminMarketplaceScreen() {
  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? colors.dark : colors.light;

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
      const token = await getItem("token");

      const resp = await fetch(LIST_ENDPOINT, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        return Alert.alert(
          "Error",
          data.message || "Failed to load marketplace items"
        );
      }

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
    if (!selectedId) {
      return Alert.alert("Select an item", "Tap a listing first");
    }

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
                  data.message || "Could not delete item"
                );
              }

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
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: isSelected ? colors.primary : themeColors.border,
          },
        ]}
      >
        <View style={styles.row}>
          <Text
            style={[styles.title, { color: themeColors.text }]}
            numberOfLines={1}
          >
            {item.prod_name ?? "Untitled"}
          </Text>

          <Text style={styles.price}>{formatPrice(item.price)}</Text>
        </View>

        {!!item.prod_desc && (
          <Text
            style={[styles.desc, { color: themeColors.mutedText }]}
            numberOfLines={2}
          >
            {item.prod_desc}
          </Text>
        )}

        <View style={styles.metaRow}>
          <Text
            style={[styles.metaText, { color: themeColors.mutedText }]}
            numberOfLines={1}
          >
            Seller: {item.user_id ?? "-"}
          </Text>

          <Text
            style={[styles.metaText, { color: themeColors.mutedText }]}
            numberOfLines={1}
          >
            Cell: {item.cell_no ?? "-"}
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
      <Text style={[styles.header, { color: themeColors.text }]}>
        Admin Marketplace
      </Text>

      {loadingList ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.mutedText }]}>
            Loading...
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: themeColors.mutedText }}>
                No marketplace items found.
              </Text>
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
            Selected: {selectedItem.prod_name ?? "Untitled"} (
            {formatPrice(selectedItem.price)})
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

  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  title: {
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },

  price: {
    fontWeight: "800",
    color: colors.primary,
  },

  desc: {
    marginTop: 6,
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