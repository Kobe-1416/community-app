import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

const Card = ({ Text1, Text2 }) => {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      <Text style={[styles.textBase, styles.text1, isDarkMode && styles.textDark]}>
        {Text1}
      </Text>
      <Text style={[styles.textBase, styles.text2, isDarkMode && styles.textDark]}>
        {Text2}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#d6d6d6",
    padding: 15,
    borderRadius: 25,
    width: "85%",
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#c7c7c7",
  },
  cardDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
  },
  textBase: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111",
  },
  text1: {},
  text2: {},
  textDark: {
    color: "#fff",
  },
});

export default Card;