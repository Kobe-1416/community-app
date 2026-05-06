import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  Pressable,
  FlatList,
  Dimensions,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

export default function ListingDetailsScreen({ route }) {
  const { isDarkMode } = useTheme();
  const listing = route?.params?.listing || {};

  const images = useMemo(() => {
    const raw = listing.images || [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    return listing.thumbnail ? [listing.thumbnail] : [];
  }, [listing]);

  const [activeIndex, setActiveIndex] = useState(0);

  const priceValue = Number(listing.price || 0);

  const openDialer = () => {
    if (!listing.phone) return;
    Linking.openURL(`tel:${listing.phone}`);
  };

  const renderMainImage = ({ item }) => (
    <View style={styles.heroImageWrap}>
      <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, isDarkMode && styles.cardDark]}>
        <FlatList
          data={images.length ? images : [listing.thumbnail]}
          renderItem={renderMainImage}
          keyExtractor={(_, index) => String(index)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const nextIndex = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(nextIndex);
          }}
          getItemLayout={(_, index) => ({
            length: width - 40,
            offset: (width - 40) * index,
            index,
          })}
        />

        {images.length > 1 && (
          <View style={styles.dotsRow}>
            {images.slice(0, 10).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  activeIndex === i && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}

        <View style={styles.thumbSection}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
            Photos
          </Text>

          <View style={styles.thumbGrid}>
            {(images.length ? images : [listing.thumbnail]).slice(0, 4).map((uri, index) => (
              <Pressable
                key={`${uri}-${index}`}
                style={styles.thumbBox}
                onPress={() => setActiveIndex(index)}
              >
                <Image source={{ uri }} style={styles.thumbImage} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, isDarkMode && styles.textDark]}>
              {listing.title}
            </Text>
            <Text style={styles.price}>R{priceValue.toLocaleString()}</Text>
          </View>

          <Text style={[styles.description, isDarkMode && styles.mutedTextDark]}>
            {listing.description || "No description provided."}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="call-outline" size={18} color={isDarkMode ? "#bbb" : "#666"} />
            <Text style={[styles.metaText, isDarkMode && styles.mutedTextDark]}>
              {listing.phone || "No phone number"}
            </Text>
          </View>

          <Pressable style={styles.callButton} onPress={openDialer}>
            <Ionicons name="call" size={18} color="#000" />
            <Text style={styles.callButtonText}>Call Seller</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  containerDark: { backgroundColor: "#121212" },
  content: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
  },

  heroImageWrap: {
    width: width - 32,
    height: 280,
    backgroundColor: "#e0e0e0",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#bbb",
  },
  dotActive: {
    backgroundColor: "#85FF27",
  },

  thumbSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
  textDark: { color: "#fff" },
  mutedTextDark: { color: "#bbb" },

  thumbGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  thumbBox: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e8e8e8",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },

  infoSection: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: "#85FF27",
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  metaText: {
    fontSize: 15,
    color: "#666",
  },

  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#85FF27",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});