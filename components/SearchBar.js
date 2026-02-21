import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function SearchBar({ value, onChangeText }) {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Ionicons
        name="search"
        size={20}
        color={isDarkMode ? "#bbb" : "#666"}
        style={styles.icon}
      />

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Search..."
        placeholderTextColor={isDarkMode ? "#888" : "#999"}
        value={value}
        onChangeText={onChangeText}
      />

      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={20}
          color={isDarkMode ? "#bbb" : "#666"}
          onPress={() => onChangeText("")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f1f1f1",
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 8,
  },
  containerDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
  },
  icon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },
  inputDark: {
    color: "#fff",
  },
});