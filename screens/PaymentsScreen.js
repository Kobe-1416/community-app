import React, { useCallback, useState } from "react";
import { API_URL } from "../config";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

const PAYMENTS_ENDPOINT = `${API_URL}/api/payments`;
const UPLOAD_ENDPOINT = `${API_URL}/api/payments/upload-proof`;

export default function PaymentsScreen() {
  const { isDarkMode } = useTheme();

  const [payments, setPayments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const theme = {
    background: isDarkMode ? "#121212" : "#f8f8f8",
    card: isDarkMode ? "#1e1e1e" : "#fff",
    text: isDarkMode ? "#fff" : "#111",
    muted: isDarkMode ? "#bbb" : "#666",
    border: isDarkMode ? "#333" : "#eee",
    input: isDarkMode ? "#2a2a2a" : "#fff",
  };

  const fetchPayments = async () => {
    setLoading(true);

    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Unauthorized", "Please log in again.");
        setPayments([]);
        return;
      }

      const res = await fetch(PAYMENTS_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.log("Payments fetch failed:", data);
        setPayments([]);
        return;
      }

      setPayments(data.payments ?? []);
    } catch (err) {
      console.error("Payments fetch error:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];

      if (!file) {
        Alert.alert("Error", "No file selected.");
        return;
      }

      setSelectedFile({
        uri: file.uri,
        name: file.name || `proof-${Date.now()}`,
        mimeType: file.mimeType || "application/octet-stream",
        size: file.size,
      });
    } catch (err) {
      console.error("Document picker error:", err);
      Alert.alert("Error", "Could not select document.");
    }
  };

  const uploadProof = async () => {
    if (!selectedFile) {
      Alert.alert("No file selected", "Please select a proof of payment first.");
      return;
    }

    if (uploading) return;

    setUploading(true);

    try {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Unauthorized", "Please log in again.");
        return;
      }

      const formData = new FormData();

      formData.append("proof", {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType,
      });

      const res = await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        Alert.alert(
          "Upload failed",
          data.message || "Could not upload proof of payment."
        );
        return;
      }

      Alert.alert("Success", "Proof of payment uploaded.");
      setSelectedFile(null);
      await fetchPayments();
    } catch (err) {
      console.error("Upload proof error:", err);
      Alert.alert("Network error", "Could not connect to server.");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString();
  };

  const formatAmount = (amount) => {
    if (!amount) return "-";

    const n = Number(amount);

    if (Number.isNaN(n)) return String(amount);

    return `R${n.toLocaleString()}`;
  };

  const getStatusStyle = (status) => {
    const normalized = status?.toLowerCase();

    if (normalized === "verified") return styles.statusVerified;
    if (normalized === "rejected") return styles.statusRejected;

    return styles.statusPending;
  };

  const PaymentCard = ({ item }) => (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Payment Proof
        </Text>

        <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>
          {item.status || "pending"}
        </Text>
      </View>

      <Text style={[styles.metaText, { color: theme.muted }]}>
        Uploaded: {formatDate(item.created_at)}
      </Text>

      <Text style={[styles.metaText, { color: theme.muted }]}>
        Amount: {formatAmount(item.confirmed_amount)}
      </Text>

      <Text style={[styles.metaText, { color: theme.muted }]}>
        Reference: {item.confirmed_reference || "-"}
      </Text>

      <Text style={[styles.metaText, { color: theme.muted }]}>
        Payment Date: {formatDate(item.confirmed_payment_date)}
      </Text>

      {!!item.original_file_url && (
        <Pressable
          style={styles.openButton}
          onPress={() => Linking.openURL(item.original_file_url)}
        >
          <Ionicons name="document-text-outline" size={16} color="#000" />
          <Text style={styles.openButtonText}>Open Proof</Text>
        </Pressable>
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Payments</Text>

      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Upload proof of payment and track verification status.
      </Text>

      <View
        style={[
          styles.uploadBox,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.uploadHeader}>
          <Ionicons
            name="cloud-upload-outline"
            size={28}
            color={isDarkMode ? "#85FF27" : "#111"}
          />

          <Text style={[styles.uploadTitle, { color: theme.text }]}>
            Upload Proof of Payment
          </Text>
        </View>

        <Text style={[styles.uploadHint, { color: theme.muted }]}>
          Accepted files: PDF, JPG, PNG, WEBP
        </Text>

        {selectedFile && (
          <View
            style={[
              styles.selectedFileBox,
              {
                backgroundColor: theme.input,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[styles.selectedFileName, { color: theme.text }]}
              numberOfLines={1}
            >
              {selectedFile.name}
            </Text>

            <Text style={[styles.selectedFileMeta, { color: theme.muted }]}>
              {selectedFile.mimeType}
            </Text>
          </View>
        )}

        <View style={styles.uploadActions}>
          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.border }]}
            onPress={pickDocument}
            disabled={uploading}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
              Choose File
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.primaryButton,
              (!selectedFile || uploading) && styles.disabledButton,
            ]}
            onPress={uploadProof}
            disabled={!selectedFile || uploading}
          >
            <Text style={styles.primaryButtonText}>
              {uploading ? "Uploading..." : "Submit"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          My Payment Proofs
        </Text>

        <Pressable onPress={fetchPayments}>
          <Ionicons
            name="refresh"
            size={22}
            color={isDarkMode ? "#bbb" : "#333"}
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={[styles.loadingText, { color: theme.muted }]}>
            Loading payments...
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={({ item }) => <PaymentCard item={item} />}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchPayments}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                No payment proofs uploaded yet.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 45,
  },

  header: {
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 15,
  },

  uploadBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
  },

  uploadHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  uploadTitle: {
    fontSize: 17,
    fontWeight: "800",
  },

  uploadHint: {
    fontSize: 13,
    marginTop: 8,
  },

  selectedFileBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  selectedFileName: {
    fontSize: 14,
    fontWeight: "700",
  },

  selectedFileMeta: {
    fontSize: 12,
    marginTop: 3,
  },

  uploadActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryButtonText: {
    fontWeight: "800",
  },

  primaryButton: {
    flex: 1,
    backgroundColor: "#85FF27",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#000",
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.55,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  listContainer: {
    paddingBottom: 100,
  },

  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },

  statusBadge: {
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: "hidden",
    textTransform: "uppercase",
    color: "#000",
  },

  statusPending: {
    backgroundColor: "#ffeaa7",
  },

  statusVerified: {
    backgroundColor: "#85FF27",
  },

  statusRejected: {
    backgroundColor: "#ffcccc",
  },

  metaText: {
    fontSize: 13,
    marginTop: 6,
  },

  openButton: {
    marginTop: 12,
    backgroundColor: "#85FF27",
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  openButtonText: {
    color: "#000",
    fontWeight: "900",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },

  loadingText: {
    marginTop: 8,
  },

  emptyBox: {
    alignItems: "center",
    marginTop: 40,
  },

  emptyText: {
    fontSize: 14,
  },
});