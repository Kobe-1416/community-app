import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function CreateListingScreen({ navigation, route }) {
  const { isDarkMode } = useTheme();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !price || !description || !phone) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }
    if (images.length < 3) {
      Alert.alert("Not enough images", "Please add at least 3 images");
      return;
    }

    const listingPayload = {
      user_id: 1,
      prod_name: title.trim(),
      price: parseFloat(price) || 0,
      prod_desc: description.trim(),
      cell_no: phone.trim(),
      images: images,
    };

    try {
      setLoading(true);
      const res = await fetch("http://10.0.2.2:3000/api/market/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create listing");
      }

      const newListing = {
        id: data.item.id.toString(),
        title: data.item.prod_name,
        price: data.item.price,
        description: data.item.prod_desc,
        phone: data.item.cell_no,
        date: data.item.created_at,
        isNew: true,
        images: data.item.images || [],
        thumbnail:
          data.item.images?.[0] ||
          `https://via.placeholder.com/300x200/85FF27/000000?text=${encodeURIComponent(
            title
          )}`,
      };

      if (route?.params?.onCreate && typeof route.params.onCreate === "function") {
        route.params.onCreate(newListing);
      }

      Alert.alert("Success", "Listing created successfully!");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (images.length >= 8) {
      Alert.alert("Maximum Reached", "You can only upload up to 8 images");
      return;
    }
    setImages([
      ...images,
      `https://via.placeholder.com/300x200/85FF27/000000?text=Image+${
        images.length + 1
      }`,
    ]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const helperColor = images.length < 3 ? "#ff4444" : "#85FF27";

  return (
    <ScrollView
      style={[styles.container, isDarkMode && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.header, isDarkMode && styles.textDark]}>
        Create New Listing
      </Text>

      <View style={[styles.section, isDarkMode && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
          Images (3-8 required)
        </Text>

        <View style={styles.imageGrid}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: img }}
                style={[styles.image, isDarkMode && styles.imageDark]}
              />
              <Pressable style={styles.removeImage} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={24} color="#ff4444" />
              </Pressable>
            </View>
          ))}

          {images.length < 8 && (
            <Pressable
              style={[styles.addImageButton, isDarkMode && styles.addImageButtonDark]}
              onPress={addImage}
            >
              <Ionicons name="add" size={30} color="#85FF27" />
              <Text style={styles.addImageText}>Add Image</Text>
              <Text style={[styles.imageCount, isDarkMode && styles.mutedTextDark]}>
                {images.length}/8
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.helperText, { color: helperColor }]}>
          {images.length < 3
            ? `Need ${3 - images.length} more images`
            : "✓ Minimum images met"}
        </Text>
      </View>

      <View style={[styles.section, isDarkMode && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>
          Listing Details
        </Text>

        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Title (e.g., iPhone 13 Pro)"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={isDarkMode ? "#888" : "#888"}
        />

        <View style={styles.priceContainer}>
          <Text style={styles.currency}>R</Text>
          <TextInput
            style={[styles.input, styles.priceInput, isDarkMode && styles.inputDark]}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor={isDarkMode ? "#888" : "#888"}
          />
        </View>

        <TextInput
          style={[styles.input, styles.textArea, isDarkMode && styles.inputDark]}
          placeholder="Description (Be detailed about condition, features, etc.)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={isDarkMode ? "#888" : "#888"}
        />

        <TextInput
          style={[styles.input, isDarkMode && styles.inputDark]}
          placeholder="Your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={isDarkMode ? "#888" : "#888"}
        />
      </View>

      <Pressable
        style={[
          styles.submitButton,
          loading && styles.submitButtonDisabled,
          isDarkMode && styles.submitButtonDarkBorder,
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Publishing..." : "Publish Listing"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 20 },
  containerDark: { backgroundColor: "#121212" },

  contentContainer: { paddingBottom: 150 },

  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 25,
    textAlign: "center",
  },

  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    shadowOpacity: 0,
    elevation: 0,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 15,
  },

  imageGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },

  imageContainer: { width: "48%", marginBottom: 10, position: "relative" },

  image: { width: "100%", height: 120, borderRadius: 8, backgroundColor: "#e0e0e0" },
  imageDark: { backgroundColor: "#2a2a2a" },

  removeImage: { position: "absolute", top: -5, right: -5 },

  addImageButton: {
    width: "48%",
    height: 120,
    borderWidth: 2,
    borderColor: "#85FF27",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  addImageButtonDark: {
    // keep the same dashed green border; just ensure the empty tile doesn’t look “light”
    backgroundColor: "transparent",
  },

  addImageText: { marginTop: 5, color: "#85FF27", fontSize: 14 },

  imageCount: { fontSize: 12, color: "#888", marginTop: 3 },

  helperText: { fontSize: 14, marginTop: 10 },

  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e6e6e6",
  },
  inputDark: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    borderColor: "#333",
  },

  priceContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },

  currency: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#85FF27",
    marginRight: 10,
    width: 30,
  },

  priceInput: { flex: 1, marginBottom: 0 }, // prevents double spacing inside the row

  textArea: { height: 120, textAlignVertical: "top" },

  submitButton: {
    backgroundColor: "#85FF27",
    borderRadius: 10,
    padding: 18,
    alignItems: "center",
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#c7c7c7",
  },
  submitButtonDarkBorder: {
    borderColor: "#333",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitText: { fontSize: 18, fontWeight: "bold", color: "#000" },

  textDark: { color: "#fff" },
  mutedTextDark: { color: "#bbb" },
});