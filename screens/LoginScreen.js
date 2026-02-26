import {
  View,
  StyleSheet,
  TextInput,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen({ navigation }) {
  const { isDarkMode } = useTheme();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setIsAdmin } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://192.168.43.215:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login failed", data.message || "Invalid credentials");
        return;
      }

      await SecureStore.setItemAsync("token", data.token);

      // Call /api/auth/me
      const meResp = await fetch("http://192.168.43.215:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const meData = await meResp.json();

      // adjust depending on your backend structure
      setIsAdmin(meData?.user?.role === "admin");

      navigation.replace("MainTabs");
      console.log("ME STATUS:", meResp.status);
      console.log("ME DATA:", meData);

    } catch (error) {
      Alert.alert("Network error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
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

        <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} />

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={[styles.createAcc, isDarkMode && styles.mutedTextDark]}>
            Don't have an account?{"\n"}Register
          </Text>
        </Pressable>
      </View>
    </ScrollView>
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
});