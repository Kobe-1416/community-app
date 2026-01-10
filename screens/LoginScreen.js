import { 
  View, 
  StyleSheet, 
  TextInput, 
  Text, 
  Pressable, 
  ScrollView,
  Alert
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import React, { useState } from "react";
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://10.67.141.147:3000/auth/login", {
        //10.0.2.2
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login failed", data.message || "Invalid credentials");
        return;
      }

      // later: store token / user info
      await SecureStore.setItemAsync("token", data.token);
      navigation.replace("MainTabs");

    } catch (error) {
      Alert.alert("Network error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>  
      <Header title="CommunityApp" />

      <View style={styles.containerInput}>
        <TextInput
          style={styles.input}
          placeholder="Cellphone"
          keyboardType="numeric"
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button
          title={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.createAcc}>
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
  },
  createAcc: {
    textAlign: "center",
    marginTop: 15,
  },
});
