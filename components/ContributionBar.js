import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ContributionsBar({ current, total }) {
  const { isDarkMode } = useTheme();
  const progress = total > 0 ? current / total : 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDarkMode && styles.textDark]}>Contributions</Text>

      <View style={[styles.barBackground, isDarkMode && styles.barBackgroundDark]}>
        <View style={[styles.barFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
      </View>

      <Text style={[styles.amount, isDarkMode && styles.mutedTextDark]}>
        {`R${current} / R${total}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginVertical: 10,
    alignItems: "center",
  },
  label: {
    fontWeight: "600",
    marginBottom: 5,
    fontSize: 20,
    color: "#111",
  },
  barBackground: {
    flexDirection: "row",
    width: "100%",
    height: 35,
    backgroundColor: "#eee",
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#4e4e4e",
  },
  barBackgroundDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
  },
  barFill: {
    backgroundColor: "#85FF27",
  },
  amount: {
    marginTop: 5,
    fontSize: 12,
    color: "#333",
  },
  textDark: {
    color: "#fff",
  },
  mutedTextDark: {
    color: "#bbb",
  },
});