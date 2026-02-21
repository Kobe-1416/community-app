import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function Header({ title }) {
  const { isDarkMode } = useTheme();

  return (
    <Text style={[styles.header, isDarkMode && styles.headerDark]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 34,
    fontWeight: "bold",
    marginTop: "40%",
    width: "100%",
    height: 90,
    textAlign: "center",
    backgroundColor: "#85FF27",
    color: "#000",
    borderRadius: 50,
    paddingTop: 20,
  },
  headerDark: {
    // keep same accent, but ensure consistent text color
    color: "#000",
  },
});