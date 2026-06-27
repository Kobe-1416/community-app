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
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import {
  ResumableZoom,
  fitContainer,
  useImageResolution,
} from "react-native-zoom-toolkit";

const PAYMENTS_ENDPOINT = `${API_URL}/api/payments`;
const UPLOAD_ENDPOINT = `${API_URL}/api/payments/upload-proof`;

// ─── Zoomable image preview (same as admin screen) ───────────────────────────

function ZoomablePreview({ uri }) {
  const { width } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution({ uri });

  if (isFetching || !resolution) {
    return (
      <View
        style={{
          width: "100%",
          height: 280,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  const size = fitContainer(resolution.width / resolution.height, {
    width: width - 32,
    height: 280,
  });

  return (
    <View
      style={{
        width: "100%",
        height: 280,
        marginTop: 12,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#eee",
      }}
    >
      <ResumableZoom maxScale={4}>
        <Image source={{ uri }} style={size} resizeMode="contain" />
      </ResumableZoom>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isImageUrl = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes(".jpg") ||
    lower.includes(".jpeg") ||
    lower.includes(".png") ||
    lower.includes(".webp") ||
    lower.includes("/image/upload/")
  );
};

const getPreviewUrl = (payment) => {
  if (payment?.preview_image_url) return payment.preview_image_url;
  if (isImageUrl(payment?.original_file_url)) return payment.original_file_url;
  return null;
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

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PaymentsScreen({ navigation }) {
  const { isDarkMode } = useTheme();

  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
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

  // ── Data fetching ──────────────────────────────────────────────────────────

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
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.log("Payments fetch failed:", { status: res.status, data });
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

  // ── File picking & upload ──────────────────────────────────────────────────

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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        console.log("Upload failed:", { status: res.status, data });
        Alert.alert("Upload failed", data.message || "Could not upload proof of payment.");
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

  // ── Status helpers ─────────────────────────────────────────────────────────

  const getStatusStyle = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === "verified") return styles.statusVerified;
    if (normalized === "rejected") return styles.statusRejected;
    return styles.statusPending;
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const previewUrl = getPreviewUrl(selectedPayment);

  const renderPaymentCard = ({ item }) => {
    const isSelected = selectedPayment?.id === item.id;

    return (
      <Pressable
        onPress={() => setSelectedPayment(item)}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: isSelected ? "#85FF27" : theme.border,
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
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>Payments</Text>

      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Upload proof of payment and track verification status.
      </Text>

      {/* ── Upload box ── */}
      <View
        style={[
          styles.uploadBox,
          { backgroundColor: theme.card, borderColor: theme.border },
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
              { backgroundColor: theme.input, borderColor: theme.border },
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

      {/* ── Payment list ── */}
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
          renderItem={renderPaymentCard}
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

      {/* ── Detail panel (overlays list, same as admin) ── */}
      {selectedPayment && (
        <View style={[styles.detailPanel, { backgroundColor: theme.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.detailTitle, { color: theme.text }]}>
              Payment Proof
            </Text>

            <Text style={[styles.metaText, { color: theme.muted }]}>
              Uploaded: {formatDate(selectedPayment.created_at)}
            </Text>

            <Text style={[styles.metaText, { color: theme.muted }]}>
              Status:{" "}
              <Text
                style={[
                  styles.statusInline,
                  getStatusStyle(selectedPayment.status),
                ]}
              >
                {selectedPayment.status || "pending"}
              </Text>
            </Text>

            {/* Zoomable preview for images */}
            {previewUrl ? (
              <ZoomablePreview uri={previewUrl} />
            ) : (
              <View
                style={[styles.noPreviewBox, { borderColor: theme.border }]}
              >
                <Ionicons
                  name="document-outline"
                  size={36}
                  color={theme.muted}
                />
                <Text style={[styles.metaText, { color: theme.muted, marginTop: 8 }]}>
                  No image preview available for this file.
                </Text>
              </View>
            )}

            {/* Confirmed details (read-only for user) */}
            <Text style={[styles.sectionLabel, { color: theme.text }]}>
              Confirmed details
            </Text>

            <View
              style={[
                styles.detailRow,
                { backgroundColor: theme.input, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.detailLabel, { color: theme.muted }]}>
                Amount
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatAmount(selectedPayment.confirmed_amount)}
              </Text>
            </View>

            <View
              style={[
                styles.detailRow,
                { backgroundColor: theme.input, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.detailLabel, { color: theme.muted }]}>
                Reference
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {selectedPayment.confirmed_reference || "-"}
              </Text>
            </View>

            <View
              style={[
                styles.detailRow,
                { backgroundColor: theme.input, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.detailLabel, { color: theme.muted }]}>
                Payment date
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDate(selectedPayment.confirmed_payment_date)}
              </Text>
            </View>

            {/* Reject reason if present */}
            {!!selectedPayment.reject_reason && (
              <View style={styles.rejectReasonBox}>
                <Text style={styles.rejectReasonLabel}>Rejection reason</Text>
                <Text style={styles.rejectReasonText}>
                  {selectedPayment.reject_reason}
                </Text>
              </View>
            )}

            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedPayment(null)}
            >
              <Text style={[styles.closeButtonText, { color: theme.muted }]}>
                Close
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  // ── Upload box ──────────────────────────────────────────────────────────────

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

  // ── List ────────────────────────────────────────────────────────────────────

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
    marginTop: 4,
  },

  // ── Detail panel ────────────────────────────────────────────────────────────

  detailPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 80,
    bottom: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  detailTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },

  statusInline: {
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
    textTransform: "uppercase",
    color: "#000",
  },

  noPreviewBox: {
    height: 140,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },

  detailLabel: {
    fontSize: 13,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "700",
  },

  rejectReasonBox: {
    marginTop: 8,
    backgroundColor: "#fff0f0",
    borderRadius: 10,
    padding: 12,
  },

  rejectReasonLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#cc0000",
    marginBottom: 4,
  },

  rejectReasonText: {
    fontSize: 13,
    color: "#333",
  },

  closeButton: {
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },

  closeButtonText: {
    fontWeight: "700",
  },

  // ── Misc ────────────────────────────────────────────────────────────────────

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