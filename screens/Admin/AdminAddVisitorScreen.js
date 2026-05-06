import React, { useState } from "react";
import { View, TextInput, Alert } from "react-native";
import Button from "../../components/Button";
import * as SecureStore from "expo-secure-store";
import { API_URL } from '../../config';

const BASE_URL = `${API_URL}`;
const ADD_VISITOR_ENDPOINT = `${BASE_URL}/api/visitors/entry`;

export default function AdminAddVisitorScreen({ navigation }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [surname, setSurname] = useState("");
  const [hostResident, setHostResident] = useState("");
  const [loading, setLoading] = useState(false);

  const VALID_PROVINCES = ["GP","WC","EC","KZN","MP","LP","NW","NC","FS"];

  const SPECIAL_PLATE_CODES = [
  "CD",   // Diplomatic Corps
  "CC",   // Consular Corps
  "DC",   // Diplomatic staff (sometimes used interchangeably)
  "M",    // Military (SANDF)
  "SAPS", // Police
  "GOV",  // Government vehicles (rare, varies)
];

  const SA_PLATE_REGEX =
    /^(?:[A-Z]{2}\s\d{2}\s[A-Z]{2}\s[A-Z]{2}|[A-Z]{3}\s\d{3}\s[A-Z]{2})$/;

  // Format plate safely
  function formatSAPlate(input) {
    const raw = input.replace(/\s+/g, "").toUpperCase();

    if (/^[A-Z]{2}\d{2}[A-Z]{4}$/.test(raw)) {
      return `${raw.slice(0,2)} ${raw.slice(2,4)} ${raw.slice(4,6)} ${raw.slice(6)}`;
    }

    if (/^[A-Z]{3}\d{3}[A-Z]{2}$/.test(raw)) {
      return `${raw.slice(0,3)} ${raw.slice(3,6)} ${raw.slice(6)}`;
    }

    return input; // do not mutate invalid partial input
  }

  // Validate plate
    function validatePlate(formatted) {
    const cleaned = formatted.trim().toUpperCase();
    const noSpaces = cleaned.replace(/\s+/g, "");
    const parts = cleaned.split(" ");

    // -------------------------
    // SPECIAL PLATES (CD / M / etc.)
    // -------------------------
    const specialPrefixes = ["CD", "CC", "DC", "M", "SAPS", "GOV"];

    if (specialPrefixes.includes(parts[0]) || specialPrefixes.includes(noSpaces.slice(0, 2))) {
      const prefix = parts[0] || noSpaces.match(/^[A-Z]+/)?.[0];

      if (!specialPrefixes.includes(prefix)) {
        Alert.alert("Invalid Plate", "Invalid special plate format");
        return false;
      }

      // Optional: light validation for length (prevents garbage input)
      if (noSpaces.length < 4 || noSpaces.length > 12) {
        Alert.alert("Invalid Plate", "Special plate number is incomplete");
        return false;
      }

      return true;
    }

    // -------------------------
    // NORMAL PLATES
    // -------------------------
    if (!SA_PLATE_REGEX.test(cleaned)) {
      Alert.alert(
        "Invalid Plate",
        "Format should be like CA 12 AB GP or ABC 123 GP"
      );
      return false;
    }

    const province = parts[parts.length - 1];

    if (!VALID_PROVINCES.includes(province)) {
      Alert.alert("Invalid Province", "Unknown province code");
      return false;
    }

    return true;
  }

    const handlePlateBlur = () => {
      const formatted = formatSAPlate(plate.trim());
      setPlate(formatted);

      if (formatted.trim().length > 0) {
        validatePlate(formatted);
      }
    };

  const handleAddVisitor = async () => {
    if (!name.trim()) return Alert.alert("Error", "Enter visitor name");

    const plateFormatted = formatSAPlate(plate.trim());

    if (!validatePlate(plateFormatted)) return;

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

      // reset form
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
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Visitor Surname"
        placeholderTextColor="#888"
        value={surname}
        onChangeText={setSurname}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Phone Number"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Car Plate Number. e.g. CA 12 AB GP"
        placeholderTextColor="#888"
        value={plate}
        onChangeText={setPlate}        // raw input only (no glitch)
        onBlur={handlePlateBlur}       // format + validate
        autoCapitalize="characters"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Host Resident / Unit Number"
        placeholderTextColor="#888"
        value={hostResident}
        onChangeText={setHostResident}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />

      <Button
        title={loading ? "Adding..." : "Add Visitor"}
        onPress={handleAddVisitor}
      />
    </View>
  );
}