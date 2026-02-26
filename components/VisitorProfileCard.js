import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function VisitorProfileCard({ visitor }) {
  const { isDarkMode } = useTheme();
    return (
      <View style={[styles.card, isDarkMode && styles.darkCard]}>
        <Text style={[styles.name, isDarkMode && styles.darkName]}>
          {visitor.name}
        </Text>
        <Text style={[styles.phone, isDarkMode && styles.darkPhone]}>
          {visitor.phone}
        </Text>
      </View>
    );
}