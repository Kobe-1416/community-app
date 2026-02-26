import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import PressableCard from "../../components/PressableCard";
import { useTheme } from "../../context/ThemeContext";

export default function AdminScreen({ navigation }) {
  const { isDarkMode } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        isDarkMode && styles.darkScrollContainer,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, isDarkMode && styles.darkText]}>Admin</Text>
      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        Manage visitors, announcements, and marketplace moderation.
      </Text>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        Controls
      </Text>

      <View style={styles.cards}>
        <PressableCard
          title="Visitors"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Visitors")}
        />
        <PressableCard
          title="Announcements"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Announcements")}
        />
        <PressableCard
          title="Marketplace"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Marketplace")}
        />
      </View>

      <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
        Quick actions
      </Text>

      <View style={styles.cards}>
        <PressableCard
          title="Add Visitor"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Add Visitor")}
        />
        <PressableCard
          title="Post Announcement"
          notificationCount={0}
          onPress={() => navigation.navigate("Admin Create Announcement")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    padding: 10,
    paddingTop: 45,
    paddingBottom: 30,
  },
  darkScrollContainer: {
    backgroundColor: "#0f0f0f",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
    width: "75%",
  },
  darkSubtitle: {
    color: "#bbb",
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "600",
  },
  darkText: {
    color: "#fff",
  },
  cards: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});