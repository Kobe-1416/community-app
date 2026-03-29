import React, { useState } from "react";
import { View, TextInput, Alert } from "react-native";
import Button from "../../components/Button";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "http://10.100.101.252:3000"; // use your PC IP
const ADD_VISITOR_ENDPOINT = `${BASE_URL}/api/visitors/entry`;

export default function AdminAddVisitorScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [surname, setSurname] = useState("");
  const [hostResident, setHostResident] = useState("");
  const [loading, setLoading] = useState(false);

  const SA_PLATE_REGEX = /^(?:[A-Z]{2}\s\d{2}\s[A-Z]{2}\s[A-Z]{2}|[A-Z]{3}\s\d{3}\s[A-Z]{2})$/i;

  // Helper function to format plate
  function formatSAPlate(input) {
    const raw = input.replace(/\s+/g, "").toUpperCase(); // remove spaces, uppercase
    // Pattern 1: 2 letters + 2 numbers + 2 letters + 2 letters (AA00BBCC)
    if (/^[A-Z]{2}\d{2}[A-Z]{4}$/.test(raw)) {
      return `${raw.slice(0,2)} ${raw.slice(2,4)} ${raw.slice(4,6)} ${raw.slice(6)}`;
    }
    // Pattern 2: 3 letters + 3 numbers + 2 letters (AAA000CC)
    if (/^[A-Z]{3}\d{3}[A-Z]{2}$/.test(raw)) {
      return `${raw.slice(0,3)} ${raw.slice(3,6)} ${raw.slice(6)}`;
    }
    return raw; // fallback if doesn't match patterns
  }

  const handleAddVisitor = async () => {
        if (!name.trim()) return Alert.alert("Error", "Enter visitor name");

        const plateFormatted = formatSAPlate(plate.trim()); // formatted with spaces
          if (!SA_PLATE_REGEX.test(plateFormatted)) {
            return Alert.alert(
              "Invalid Plate",
              "Plate number must be in South African format (AA 00 BB CC or AAA 000 CC)."
            );
          }

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
              surname: surname.trim(),
              phone: phone.trim(),
              plate: plateFormatted,
              host_resident: hostResident.trim(),
            }),
          });

          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) {
            console.log("Add visitor failed:", data);
            return Alert.alert("Failed", data.message || "Could not add visitor");
          }

          Alert.alert("Success", "Visitor added");
          setName("");
          setSurname("");
          setPhone("");
          setPlate("");
          setHostResident("");
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
        placeholder="Visitor Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Visitor Surname"
        value={surname}
        onChangeText={setSurname}
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
        onChangeText={(text) => setPlate(formatSAPlate(text.replace(/\s+/g, "")))}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />
      <TextInput
        placeholder="Host Resident / Unit Number"
        value={hostResident}
        onChangeText={setHostResident}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />

      <Button title={loading ? "Adding..." : "Add Visitor"} onPress={handleAddVisitor} />
    </View>
  );
}