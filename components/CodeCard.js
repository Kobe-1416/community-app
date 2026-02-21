import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const CodeCard = ({ largeText, smallText }) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <Text style={[styles.largeText, isDarkMode && styles.largeTextDark]}>
        {largeText}
      </Text>
      <Text style={[styles.smallText, isDarkMode && styles.smallTextDark]}>
        {smallText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#85FF27da",
    padding: 15,
    marginBottom: 5,
    borderRadius: 35,
    alignItems: "center",
    height: 140,
    width: "84%",
    borderWidth: 1,
    borderColor: "#c7c7c7",
  },
  cardDark: {
    // Keep the accent look but slightly darker border so it doesn’t look “light theme”
    borderColor: "#333",
  },
  largeText: {
    fontSize: 55,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    color: "#000",
  },
  largeTextDark: {
    color: "#000", // still readable on the green card
  },
  smallText: {
    fontSize: 16,
    color: "black",
    marginTop: 2,
  },
  smallTextDark: {
    color: "#111",
  },
});

export default CodeCard;