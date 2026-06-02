import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import * as SecureStore from "expo-secure-store";

import PressableCard from "../../components/PressableCard";
import { useTheme } from "../../context/ThemeContext";
import { API_URL } from "../../config";

export default function AdminScreen({ navigation }) {
  const { isDarkMode } = useTheme();

  const [resettingGateCodes, setResettingGateCodes] = useState(false);

  const [gateCodeInput, setGateCodeInput] = useState("");
  const [checkingGateCode, setCheckingGateCode] = useState(false);
  const [gateCodeResult, setGateCodeResult] = useState(null);

  const handleResetGateCodes = async () => {
    if (resettingGateCodes) return;

    try {
      setResettingGateCodes(true);

      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Unauthorized", "No login token found. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/gate-codes/del`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          "Reset failed",
          data.message || "Failed to reset gate codes."
        );
        return;
      }

      Alert.alert("Success", "Gate codes reset successfully.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while resetting gate codes.");
    } finally {
      setResettingGateCodes(false);
    }
  };

  const handleCheckGateCode = async () => {
    const code = gateCodeInput.trim();

    if (!code) {
      Alert.alert("Missing code", "Please enter a gate code.");
      return;
    }

    if (checkingGateCode) return;

    try {
      setCheckingGateCode(true);
      setGateCodeResult(null);

      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        Alert.alert("Unauthorized", "No login token found. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/gate-codes/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gateCode: code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        Alert.alert(
          "Check failed",
          data.message || "Failed to check gate code."
        );
        return;
      }

      setGateCodeResult(data.exists ? "valid" : "invalid");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while checking the gate code.");
    } finally {
      setCheckingGateCode(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        isDarkMode && styles.darkScrollContainer,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, isDarkMode && styles.darkText]}>Admin</Text>

      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        Manage visitors, announcements, and marketplace moderation.
      </Text>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        Controls
      </Text>

      <View style={styles.cards}>
        <PressableCard
          title="Visitors"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Visitors")}
        />

        <PressableCard
          title="Announcements"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Announcements")}
        />

        <PressableCard
          title="Marketplace"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Marketplace")}
        />
      </View>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        Quick actions
      </Text>

      <View style={styles.cards}>
        <PressableCard
          title="Add Visitor"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Add Visitor")}
        />

        <PressableCard
          title="Post Announcement"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Create Announcement")}
        />
      </View>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        Verify gate code
      </Text>

      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        Enter a gate code to check if it exists.
      </Text>

      <View style={styles.verifyContainer}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="Enter gate code"
          placeholderTextColor={isDarkMode ? "#888" : "#777"}
          value={gateCodeInput}
          onChangeText={(text) => {
            setGateCodeInput(text);
            setGateCodeResult(null);
          }}
          autoCapitalize="characters"
        />

        <Pressable
          style={[
            styles.verifyButton,
            checkingGateCode && styles.disabledButton,
          ]}
          onPress={handleCheckGateCode}
          disabled={checkingGateCode}
        >
          <Text style={styles.verifyButtonText}>
            {checkingGateCode ? "Checking..." : "Verify Code"}
          </Text>
        </Pressable>

        {gateCodeResult === "valid" && (
          <Text style={styles.successText}>Gate code exists.</Text>
        )}

        {gateCodeResult === "invalid" && (
          <Text style={styles.errorText}>Gate code does not exist.</Text>
        )}
      </View>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        Reset gate codes
      </Text>

      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        Delete all existing gate codes and unassign them from users.
      </Text>

      <View style={styles.cards}>
        <PressableCard
          title={resettingGateCodes ? "Resetting..." : "Reset Gate Codes"}
          notificationCount={0}
          onPress={handleResetGateCodes}
        />
      </View>

      {resettingGateCodes && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkSubtitle]}>
            Resetting gate codes...
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: 10,
    paddingTop: 45,
    paddingBottom: 30,
  },

  darkScrollContainer: {
    backgroundColor: "#0f0f0f",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    width: "75%",
  },

  darkSubtitle: {
    color: "#bbb",
  },

  sectionTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "600",
  },

  darkText: {
    color: "#fff",
  },

  cards: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  verifyContainer: {
    width: "85%",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },

  input: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 12,
    color: "#111",
    backgroundColor: "#fff",
  },

  darkInput: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    color: "#fff",
  },

  verifyButton: {
    width: "100%",
    backgroundColor: "#85FF27",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  verifyButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },

  disabledButton: {
    opacity: 0.7,
  },

  successText: {
    marginTop: 10,
    color: "#32cd32",
    fontWeight: "600",
  },

  errorText: {
    marginTop: 10,
    color: "#ff4444",
    fontWeight: "600",
  },

  loadingContainer: {
    marginTop: 10,
    alignItems: "center",
    gap: 8,
  },

  loadingText: {
    fontSize: 13,
    color: "#444",
  },
});