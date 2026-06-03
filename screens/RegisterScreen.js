import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import * as SecureStore from "expo-secure-store";
import { colors } from "../styles/colors";
import { useTheme } from "../context/ThemeContext";
import React, { useState, useRef, useEffect } from "react";
import { API_URL } from "../config";

export default function RegisterScreen({ navigation }) {
  const [surname, setSurname] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const { isDarkMode } = useTheme();
  const themeColors = isDarkMode ? colors.dark : colors.light;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: themeColors.input,
      borderColor: themeColors.border,
      color: themeColors.text,
    },
  ];

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

  const handleRegister = async () => {
    if (loading) return;

    if (
      !surname ||
      !houseNumber ||
      !streetName ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          surname,
          house_number: houseNumber,
          street_name: streetName,
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      const loginResp = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const loginData = await loginResp.json();

      if (!loginData.token) {
        alert("Login failed after registration");
        return;
      }

      await SecureStore.setItemAsync("token", loginData.token);

      navigation.replace("MainTabs");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.screen,
        { backgroundColor: themeColors.background },
      ]}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        <Header title="CommunityApp" />

        <View style={styles.container}>
          <TextInput
            style={inputStyle}
            placeholder="Surname"
            placeholderTextColor={themeColors.placeholder}
            value={surname}
            onChangeText={setSurname}
          />

          <TextInput
            style={inputStyle}
            placeholder="House Number"
            placeholderTextColor={themeColors.placeholder}
            value={houseNumber}
            onChangeText={setHouseNumber}
          />

          <TextInput
            style={inputStyle}
            placeholder="Street Name"
            placeholderTextColor={themeColors.placeholder}
            value={streetName}
            onChangeText={setStreetName}
          />

          <TextInput
            style={inputStyle}
            placeholder="Cellphone Number"
            placeholderTextColor={themeColors.placeholder}
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />

          <TextInput
            style={inputStyle}
            placeholder="Password"
            placeholderTextColor={themeColors.placeholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={inputStyle}
            placeholder="Confirm Password"
            placeholderTextColor={themeColors.placeholder}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button title="Register" onPress={handleRegister} />
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />

          <Animated.Text style={[styles.overlayText, { opacity: fadeAnim }]}>
            Creating Account...
          </Animated.Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 35,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },

  input: {
    width: "86%",
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
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