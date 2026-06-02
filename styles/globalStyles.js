import { StyleSheet } from "react-native";
import { colors } from "./colors";

export function createGlobalStyles(isDarkMode) {
  const theme = isDarkMode ? colors.dark : colors.light;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollScreen: {
      flexGrow: 1,
      backgroundColor: theme.background,
      padding: 20,
    },

    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },

    paddedCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },

    shadowCard: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0 : 0.1,
      shadowRadius: 4,
      elevation: isDarkMode ? 0 : 3,
    },

    header: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 25,
      textAlign: "center",
    },

    largeHeader: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 30,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 15,
    },

    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
    },

    bodyText: {
      fontSize: 16,
      color: theme.mutedText,
      lineHeight: 22,
    },

    mutedText: {
      color: theme.mutedText,
    },

    input: {
      backgroundColor: theme.input,
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      color: theme.text,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
    },

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
    },

    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDarkMode ? colors.dark.border : colors.light.borderStrong,
    },

    primaryButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#000",
    },

    floatingButton: {
      position: "absolute",
      right: 20,
      bottom: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: isDarkMode ? colors.dark.border : colors.light.borderStrong,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0 : 0.3,
      shadowRadius: 5,
      elevation: isDarkMode ? 0 : 8,
    },

    dangerText: {
      color: colors.danger.main,
    },

    priceText: {
      color: colors.primary,
      fontWeight: "bold",
    },
  });
}