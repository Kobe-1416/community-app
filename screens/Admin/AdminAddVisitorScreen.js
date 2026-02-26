import React, { useState } from "react";
import { View, TextInput, Alert } from "react-native";
import Button from "../../components/Button";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://192.168.43.215:3000"; // use your PC IP
const ADD_VISITOR_ENDPOINT = `${BASE_URL}/api/visitors/entry`;

export default function AdminAddVisitorScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddVisitor = async () => {
    if (!name.trim()) return Alert.alert("Error", "Enter visitor name");

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) return Alert.alert("Error", "Not logged in");

      const resp = await fetch(ADD_VISITOR_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          plate: plate.trim(),
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        return Alert.alert("Failed", data.message || "Could not add visitor");
      }

      Alert.alert("Success", "Visitor added");
      setName("");
      setPhone("");
      setPlate("");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Network error", "Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <TextInput
        placeholder="Visitor Name & Surname"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Car Plate Number"
        value={plate}
        onChangeText={setPlate}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />

      <Button title={loading ? "Adding..." : "Add Visitor"} onPress={handleAddVisitor} />
    </View>
  );
}