import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import React, { useState, useRef, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../config";

export default function LoginScreen({ navigation }) {
  const { isDarkMode } = useTheme();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setIsAdmin } = useAuth();

  // Animation value
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(0.3);
    }
  }, [loading]);

  const handleLogin = async () => {
    if (loading) return; // guard against spam

    if (!phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login failed", data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      await SecureStore.setItemAsync("token", data.token);

      const meResp = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const meData = await meResp.json();

      setIsAdmin(meData?.user?.role === "admin");

      navigation.replace("MainTabs");
    } catch (error) {
      Alert.alert("Network error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          isDarkMode && styles.containerDark,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Header title="CommunityApp" />

        <View style={styles.containerInput}>
          <TextInput
            style={[styles.input, isDarkMode && styles.inputDark]}
            placeholder="Cellphone"
            placeholderTextColor={isDarkMode ? "#888" : "#666"}
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={[styles.input, isDarkMode && styles.inputDark]}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? "#888" : "#666"}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button title="Login" onPress={handleLogin} />

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={[styles.createAcc, isDarkMode && styles.mutedTextDark]}>
              Don't have an account?{"\n"}Register
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Overlay */}
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />

          <Animated.Text
            style={[
              styles.overlayText,
              { opacity: fadeAnim }, // animated fade
            ]}
          >
            Logging in...
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  containerDark: {
    backgroundColor: "#121212",
  },

  containerInput: {
    justifyContent: "center",
    flex: 1,
    alignItems: "center",
  },

  input: {
    width: "86%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#111",
  },
  inputDark: {
    backgroundColor: "#2a2a2a",
    borderColor: "#333",
    color: "#fff",
  },

  createAcc: {
    textAlign: "center",
    marginTop: 15,
    color: "#111",
  },

  mutedTextDark: {
    color: "#bbb",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    elevation: 10,
  },

  overlayText: {
    marginTop: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});