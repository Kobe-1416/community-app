import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const PressableCard = ({ title, notificationCount = 0, onPress }) => {
  const { isDarkMode } = useTheme();

  return (
    <Pressable style={[styles.card, isDarkMode && styles.cardDark]} onPress={onPress}>
      {notificationCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationText}>{notificationCount}</Text>
        </View>
      )}

      <Text style={[styles.title, isDarkMode && styles.titleDark]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#85ff27da",
    borderRadius: 16,
    paddingVertical: 30,
    width: "42%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: "2%",
    marginHorizontal: "2%",
    borderWidth: 1,
    borderColor: "#c7c7c7",
  },
  cardDark: {
    borderColor: "#333",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "red",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },
  titleDark: {
    color: "#000", // still on green background
  },
});

export default PressableCard;