import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function MarketPlaceScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const [listings, setListings] = useState([]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays === 0) return "Today";
    return `${diffDays} days ago`;
  };

  const fetchListings = async () => {
    try {
      const res = await fetch("http://192.168.43.215:3000/api/market/items");
      const data = await res.json();

      const mapped = data.items.map((item) => {
        const createdDate = new Date(item.created_at);
        const now = new Date();
        const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

        return {
          id: item.id.toString(),
          title: item.prod_name,
          description: item.prod_desc,
          price: item.price,
          phone: item.cell_no,
          date: item.created_at,
          isNew: diffDays <= 2,
          thumbnail:
            "https://via.placeholder.com/300x200/CCCCCC/000000?text=Item",
        };
      });

      setListings(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const ListingCard = ({ item }) => (
    <Pressable
      style={[styles.card, isDarkMode && styles.cardDark]}
      onPress={() => {}}
    >
      {item.isNew && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}

      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="cover" />

      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isDarkMode && styles.textDark]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.price}>R{item.price.toLocaleString()}</Text>
        </View>

        <Text
          style={[styles.description, isDarkMode && styles.mutedTextDark]}
          numberOfLines={2}
        >
          {item.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.contactRow}>
            <Ionicons
              name="call-outline"
              size={16}
              color={isDarkMode ? "#bbb" : "#666"}
            />
            <Text style={[styles.phone, isDarkMode && styles.mutedTextDark]}>
              {item.phone}
            </Text>
          </View>

          <Text style={[styles.date, isDarkMode && styles.mutedTextDark]}>
            {formatDate(item.date)}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.searchContainer, isDarkMode && styles.searchContainerDark]}>
        <Ionicons
          name="search"
          size={20}
          color={isDarkMode ? "#bbb" : "#666"}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
          placeholder="Search marketplace..."
          placeholderTextColor={isDarkMode ? "#888" : "#888"}
        />
      </View>

      <FlatList
        data={listings}
        renderItem={({ item }) => <ListingCard item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContainer,
          isDarkMode && styles.listContainerDark,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={[styles.addButton, isDarkMode && styles.addButtonDark]}
        onPress={() =>
          navigation.navigate("CreateListing", {
            onCreate: (newListing) => {
              setListings((prev) => [newListing, ...prev]);
            },
          })
        }
      >
        <Ionicons name="add" size={32} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  containerDark: { backgroundColor: "#121212" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchContainerDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    shadowOpacity: 0, // shadows look dirty on dark; optional
    elevation: 0,
  },

  searchIcon: { marginRight: 10 },

  searchInput: { flex: 1, height: "100%", fontSize: 16, color: "#333" },
  searchInputDark: { color: "#fff" },

  listContainer: { paddingHorizontal: 10, paddingBottom: 100 },
  listContainerDark: { backgroundColor: "#121212" },

  row: { justifyContent: "space-between", marginBottom: 15 },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
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

  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#85FF27",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#000" },

  thumbnail: { width: "100%", height: 140, backgroundColor: "#e0e0e0" },

  cardContent: { padding: 12 },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  title: { fontSize: 16, fontWeight: "600", color: "#000", flex: 1, marginRight: 8 },

  price: { fontSize: 18, fontWeight: "bold", color: "#85FF27" },

  description: { fontSize: 14, color: "#666", lineHeight: 18, marginBottom: 12 },

  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  contactRow: { flexDirection: "row", alignItems: "center" },

  phone: { fontSize: 13, color: "#666", marginLeft: 5 },

  date: { fontSize: 12, color: "#888" },

  textDark: { color: "#fff" },
  mutedTextDark: { color: "#bbb" },

  addButton: {
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
  addButtonDark: {
    borderColor: "#333",
  },
});