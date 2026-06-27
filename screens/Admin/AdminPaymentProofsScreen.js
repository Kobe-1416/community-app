import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Linking,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  ResumableZoom,
  fitContainer,
  useImageResolution,
} from "react-native-zoom-toolkit";
import { useFocusEffect } from "@react-navigation/native";

import Button from "../../components/Button";
import { useTheme } from "../../context/ThemeContext";
import { API_URL, getItem } from "../../config";

const PAYMENTS_ENDPOINT = `${API_URL}/api/payments`;

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
        <Image
          source={{ uri }}
          style={size}
          resizeMode="contain"
        />
      </ResumableZoom>
    </View>
  );
}

export default function AdminPaymentProofsScreen() {
  const { isDarkMode } = useTheme();

  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [filter, setFilter] = useState("pending");

  const theme = {
    background: isDarkMode ? "#121212" : "#f8f8f8",
    card: isDarkMode ? "#1e1e1e" : "#fff",
    text: isDarkMode ? "#fff" : "#111",
    muted: isDarkMode ? "#bbb" : "#666",
    border: isDarkMode ? "#333" : "#e5e5e5",
    input: isDarkMode ? "#2a2a2a" : "#fff",
  };

  const fetchPayments = async () => {
    setLoading(true);

    try {
      const token = await getItem("token");

      if (!token) {
        Alert.alert("Unauthorized", "Please log in again.");
        return;
      }

      const res = await fetch(PAYMENTS_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        Alert.alert("Error", data.message || "Failed to load payments.");
        return;
      }

      setPayments(data.payments ?? []);
    } catch (err) {
      console.error("Fetch payments error:", err);
      Alert.alert("Network error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  useEffect(() => {
    if (!selectedPayment) return;

    setAmount(
      selectedPayment.confirmed_amount
        ? String(selectedPayment.confirmed_amount)
        : ""
    );

    setReference(selectedPayment.confirmed_reference || "");

    setPaymentDate(
      selectedPayment.confirmed_payment_date
        ? String(selectedPayment.confirmed_payment_date).split("T")[0]
        : ""
    );

    setRejectReason("");
  }, [selectedPayment]);

  const filteredPayments = useMemo(() => {
    if (filter === "all") return payments;

    return payments.filter(
      (payment) => payment.status?.toLowerCase() === filter
    );
  }, [payments, filter]);

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

    if (isImageUrl(payment?.original_file_url)) {
      return payment.original_file_url;
    }

    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString();
  };

  const handleVerify = async () => {
    if (!selectedPayment) {
      Alert.alert("No payment selected", "Select a payment proof first.");
      return;
    }

    if (!amount.trim() || !reference.trim() || !paymentDate.trim()) {
      Alert.alert(
        "Missing details",
        "Amount, reference, and payment date are required."
      );
      return;
    }

    setSubmitting(true);

    try {
      const token = await getItem("token");

      const res = await fetch(
        `${PAYMENTS_ENDPOINT}/${selectedPayment.id}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Number(amount),
            reference: reference.trim(),
            paymentDate: paymentDate.trim(),
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        Alert.alert("Failed", data.message || "Could not verify payment.");
        return;
      }

      Alert.alert("Success", "Payment verified.");
      setSelectedPayment(null);
      await fetchPayments();
    } catch (err) {
      console.error("Verify payment error:", err);
      Alert.alert("Network error", "Could not connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment) {
      Alert.alert("No payment selected", "Select a payment proof first.");
      return;
    }

    Alert.alert(
      "Reject payment?",
      "This will mark the proof as rejected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setSubmitting(true);

            try {
              const token = await getItem("token");

              const res = await fetch(
                `${PAYMENTS_ENDPOINT}/${selectedPayment.id}/reject`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    reason: rejectReason.trim() || "Rejected by admin",
                  }),
                }
              );

              const data = await res.json().catch(() => ({}));

              if (!res.ok || !data.success) {
                Alert.alert("Failed", data.message || "Could not reject payment.");
                return;
              }

              Alert.alert("Rejected", "Payment proof rejected.");
              setSelectedPayment(null);
              await fetchPayments();
            } catch (err) {
              console.error("Reject payment error:", err);
              Alert.alert("Network error", "Could not connect to server.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const renderPaymentCard = ({ item }) => {
    const isSelected = selectedPayment?.id === item.id;

    return (
      <Pressable
        onPress={() => setSelectedPayment(item)}
        style={[
          styles.paymentCard,
          {
            backgroundColor: theme.card,
            borderColor: isSelected ? "#85FF27" : theme.border,
          },
        ]}
      >
        <View style={styles.paymentHeader}>
          <Text style={[styles.paymentTitle, { color: theme.text }]}>
            {item.surname || "Unknown Resident"}
          </Text>

          <Text
            style={[
              styles.statusBadge,
              item.status === "verified" && styles.statusVerified,
              item.status === "rejected" && styles.statusRejected,
            ]}
          >
            {item.status || "pending"}
          </Text>
        </View>

        <Text style={[styles.metaText, { color: theme.muted }]}>
          House: {item.house_number || "-"} {item.street_name || ""}
        </Text>

        <Text style={[styles.metaText, { color: theme.muted }]}>
          Phone: {item.phone || "-"}
        </Text>

        <Text style={[styles.metaText, { color: theme.muted }]}>
          Uploaded: {formatDate(item.created_at)}
        </Text>
      </Pressable>
    );
  };

  const previewUrl = getPreviewUrl(selectedPayment);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        Payment Proofs
      </Text>

      <Text style={[styles.subheader, { color: theme.muted }]}>
        Compare the uploaded proof with extracted text, then verify or reject.
      </Text>

      <View style={styles.filterRow}>
        {["pending", "verified", "rejected", "all"].map((status) => (
          <Pressable
            key={status}
            onPress={() => setFilter(status)}
            style={[
              styles.filterButton,
              {
                backgroundColor: filter === status ? "#85FF27" : theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === status ? "#000" : theme.text },
              ]}
            >
              {status}
            </Text>
          </Pressable>
        ))}
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
          data={filteredPayments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPaymentCard}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchPayments}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              No payment proofs found.
            </Text>
          }
        />
      )}

      {selectedPayment && (
        <View style={[styles.detailPanel, { backgroundColor: theme.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.detailTitle, { color: theme.text }]}>
              Review Payment Proof
            </Text>

            <Text style={[styles.metaText, { color: theme.muted }]}>
              Resident: {selectedPayment.surname || "-"}
            </Text>

            <Text style={[styles.metaText, { color: theme.muted }]}>
              House: {selectedPayment.house_number || "-"}{" "}
              {selectedPayment.street_name || ""}
            </Text>

            {previewUrl ? (
              <ZoomablePreview uri={previewUrl} />
            ) : (
              <View
                style={[
                  styles.noPreviewBox,
                  { borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metaText, { color: theme.muted }]}>
                  No image preview available for this file.
                </Text>
              </View>
            )}

            {!!selectedPayment.original_file_url && (
              <Pressable
                style={styles.openDocButton}
                onPress={() => Linking.openURL(selectedPayment.original_file_url)}
              >
                <Text style={styles.openDocText}>Open Original Document</Text>
              </Pressable>
            )}

            <Text style={[styles.sectionLabel, { color: theme.text }]}>
              Extracted text
            </Text>

            {!!selectedPayment.possible_amount_text && (
              <Text style={[styles.extractedText, { color: theme.muted }]}>
                Amount section: {selectedPayment.possible_amount_text}
              </Text>
            )}

            {!!selectedPayment.possible_reference_text && (
              <Text style={[styles.extractedText, { color: theme.muted }]}>
                Reference section: {selectedPayment.possible_reference_text}
              </Text>
            )}

            {!!selectedPayment.possible_date_text && (
              <Text style={[styles.extractedText, { color: theme.muted }]}>
                Date section: {selectedPayment.possible_date_text}
              </Text>
            )}

            <Text style={[styles.sectionLabel, { color: theme.text }]}>
              Confirm details
            </Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount e.g. 850.00"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />

            <TextInput
              value={reference}
              onChangeText={setReference}
              placeholder="Payment reference"
              placeholderTextColor="#888"
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />

            <TextInput
              value={paymentDate}
              onChangeText={setPaymentDate}
              placeholder="Payment date e.g. 2026-06-06"
              placeholderTextColor="#888"
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />

            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Reject reason optional"
              placeholderTextColor="#888"
              style={[
                styles.input,
                {
                  backgroundColor: theme.input,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />

            <Button
              title={submitting ? "Verifying..." : "Verify Payment"}
              onPress={handleVerify}
            />

            <View style={{ height: 10 }} />

            <Pressable
              style={styles.rejectButton}
              onPress={handleReject}
              disabled={submitting}
            >
              <Text style={styles.rejectButtonText}>
                {submitting ? "Processing..." : "Reject Payment"}
              </Text>
            </Pressable>

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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 30,
  },

  subheader: {
    fontSize: 13,
    marginTop: 6,
    marginBottom: 14,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },

  filterText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  listContent: {
    paddingBottom: 20,
  },

  paymentCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },

  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  paymentTitle: {
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
  },

  statusBadge: {
    backgroundColor: "#ffeaa7",
    color: "#000",
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    textTransform: "uppercase",
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

  detailPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 80,
    bottom: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 10,
  },

  detailTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  previewImage: {
    width: "100%",
    height: 280,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#eee",
  },

  noPreviewBox: {
    height: 120,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },

  openDocButton: {
    marginTop: 10,
    backgroundColor: "#85FF27",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  openDocText: {
    color: "#000",
    fontWeight: "800",
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
  },

  extractedText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  rejectButton: {
    backgroundColor: "#ff4444",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  rejectButtonText: {
    color: "#fff",
    fontWeight: "800",
  },

  closeButton: {
    padding: 14,
    alignItems: "center",
  },

  closeButtonText: {
    fontWeight: "700",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },

  loadingText: {
    marginTop: 8,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
  },
});