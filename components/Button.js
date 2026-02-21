import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Button({ title, onPress, color = "#85FF27" }) {
  const { isDarkMode } = useTheme();

  // Keep your accent button color by default; only change border/text if needed
  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: color },
        isDarkMode && styles.buttonDark,
      ]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#85FF27",
    padding: 15,
    borderRadius: 25,
    width: "60%",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#c7c7c7",
  },
  buttonDark: {
    borderColor: "#333",
  },
  buttonText: {
    color: "#000000ff",
    fontWeight: "bold",
    fontSize: 18,
  },
});