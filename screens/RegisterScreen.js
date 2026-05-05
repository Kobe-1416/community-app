import { 
  View, 
  StyleSheet, 
  TextInput, 
  Text, 
  Pressable, 
  ScrollView,
  ActivityIndicator,
  Animated,
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import * as SecureStore from "expo-secure-store";
import React, { useState, useRef, useEffect } from "react";
import { API_URL } from '../config';

export default function RegisterScreen({ navigation }) {
  const [surname, setSurname] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

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
    if (loading) return; // prevent spam

    if (!surname || !houseNumber || !streetName || !phone || !password) {
      alert("Please fill in all fields");
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
        setLoading(false);
        return;
      }

      // Auto login
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
        setLoading(false);
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
    <View style={{ flex: 1 }}>
      <ScrollView>
        <Header title="CommunityApp" />

        <View style={styles.container}>
          <TextInput style={styles.input} placeholder="Surname" value={surname} onChangeText={setSurname} />
          <TextInput style={styles.input} placeholder="House Number" value={houseNumber} onChangeText={setHouseNumber}/>
          <TextInput style={styles.input} placeholder="Street Name" value={streetName} onChangeText={setStreetName}/>
          <TextInput style={styles.input} placeholder="Cellphone Number" keyboardType="numeric" value={phone} onChangeText={setPhone}/>
          <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
          <Button title="Register" onPress={handleRegister}/>
        </View>
      </ScrollView>

      {/* Overlay */}
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Animated.Text style={[styles.overlayText, { opacity: fadeAnim }]}>
            Creating Account...
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    borderColor: "#ccc",
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