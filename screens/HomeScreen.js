// screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import CodeCard from "../components/CodeCard";
import ContributionsBar from "../components/ContributionBar";
import Card from "../components/Card";
import PressableCard from "../components/PressableCard";
import { ScrollView, RefreshControl, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, getItem } from "../config";

const BASE_URL = `${API_URL}`;
const DASHBOARD_ENDPOINT = `${BASE_URL}/api/dashboard`;
const DASHBOARD_CACHE_KEY = "dashboardCache_v1";

export default function HomeScreen({ navigation }) {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    gateCode: null,
    weekEnd: null,
    role: "user",
    contributions: { current: 0, total: 1 },
    visitorsTotal: 0,
    visitorsInside: 0,
    visitorsList: [],
    marketplaceCount: 0,
    announcementsCount: 0,
  });

  const [showVisitorsTotal, setshowVisitorsTotal] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const cached = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
        if (cached && mounted) {
          setDashboard(JSON.parse(cached));
        }
      } catch (err) {
        console.warn("Failed to read dashboard cache", err);
      }

      await fetchDashboard();
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchDashboard();
    } catch (err) {
      console.error("Error refreshing", err);
      Alert.alert("Error", "Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const token = await getItem("token");

      if (!token) {
        Alert.alert("Not authenticated", "Please login again.");
        return;
      }

      const resp = await fetch(DASHBOARD_ENDPOINT, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!resp.ok) {
        if (resp.status === 401) {
          Alert.alert("Session expired", "Please log in again.");
        } else {
          console.warn("Failed to fetch dashboard", resp.status);
        }
        return;
      }

      const data = await resp.json();

      const mapped = {
        gateCode: data.gateCode || null,
        weekEnd: data.weekEnd || null,
        role: data.role || "user",
        contributions: {
          current: data.contributions?.current ?? 0,
          total: data.contributions?.total ?? 1,
        },
        visitorsTotal: data.visitorsSummary?.todayTotal ?? 0,
        visitorsInside: data.visitorsSummary?.stillInside ?? 0,
        visitorsList: data.visitorsList ?? [],
        marketplaceCount: data.counts?.marketplace ?? 0,
        announcementsCount: data.counts?.announcements ?? 0,
      };

      setDashboard(mapped);

      try {
        await AsyncStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(mapped));
      } catch (err) {
        console.warn("Failed to cache dashboard", err);
      }
    } catch (err) {
      console.error("Network error fetching dashboard", err);
    }
  };

  const generateGateCodes = async () => {
    try {
      const token = await getItem("token");

      if (!token) {
        Alert.alert("Error", "Not authenticated");
        return;
      }

      const resp = await fetch(`${BASE_URL}/api/gate-codes/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) {
        throw new Error("Failed to generate codes");
      }

      Alert.alert("Success", "New gate codes generated");
      await fetchDashboard();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not generate codes");
    }
  };

  const {
    gateCode,
    weekEnd,
    contributions,
    visitorsTotal,
    visitorsInside,
    visitorsList,
    marketplaceCount,
    announcementsCount,
  } = dashboard;

  const formattedWeekEnd = weekEnd
    ? new Date(weekEnd).toISOString().split("T")[0]
    : "—";

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        isDarkMode && styles.darkScrollContainer,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} />
      }
    >
      <CodeCard
        largeText={gateCode ? gateCode : "—"}
        smallText={
          gateCode ? `expires: ${formattedWeekEnd}` : "no code available"
        }
      />

      {dashboard.role === "admin" && (
        <Pressable
          style={{
            marginTop: 10,
            marginBottom: 10,
            backgroundColor: "#85FF27",
            padding: 12,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#c7c7c7",
            width: "70%",
          }}
          onPress={() =>
            Alert.alert(
              "Generate Codes",
              "This will replace all current gate codes. Continue?",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Yes", onPress: generateGateCodes },
              ]
            )
          }
        >
          <Text style={{ color: "#333", textAlign: "center", fontWeight: "600" }}>
            Generate New Gate Codes
          </Text>
        </Pressable>
      )}

      <Text style={[styles.subtitle, isDarkMode && styles.darkSubtitle]}>
        Give the guard the code to exit and enter the community.
      </Text>

      <ContributionsBar
        current={contributions.current}
        total={contributions.total}
      />

      <Text style={styles.visitor}>Today</Text>

      <Pressable onPress={() => setshowVisitorsTotal(!showVisitorsTotal)}>
        <Card Text1="Total Visitors: " Text2={`${visitorsTotal}`} />
      </Pressable>

      {showVisitorsTotal && (
        <View style={styles.visitorList}>
          {visitorsList.map((visitor) => (
            <View key={visitor.id} style={styles.visitorItem}>
              <Text style={styles.visitorName}>{visitor.name ?? "Unknown"}</Text>
              <Text style={styles.visitorDetail}>Cell: {visitor.phone ?? "-"}</Text>
              <Text style={styles.visitorDetail}>Plate: {visitor.plate ?? "-"}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={() => setShowVisitors(!showVisitors)}>
        <Card Text1="Still Inside: " Text2={`${visitorsInside}`} />
      </Pressable>

      {showVisitors && (
        <View style={styles.visitorList}>
          {visitorsList
            .filter((v) => !v.exit_time)
            .map((visitor) => (
              <View key={visitor.id} style={styles.visitorItem}>
                <Text style={styles.visitorName}>{visitor.name ?? "Unknown"}</Text>
                <Text style={styles.visitorDetail}>Cell: {visitor.phone ?? "-"}</Text>
                <Text style={styles.visitorDetail}>Plate: {visitor.plate ?? "-"}</Text>
              </View>
            ))}
        </View>
      )}

      <Text style={styles.quickAcc}>Quick Access</Text>
      <View style={styles.pressCards}>
        <PressableCard
          title="Market Place"
          notificationCount={marketplaceCount}
          onPress={() => navigation.navigate("Market Place")}
        />
        <PressableCard
          title="Notice Board"
          notificationCount={announcementsCount}
          onPress={() => navigation.navigate("Notice Board")}
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
  visitor: {
    marginTop: 40,
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginBottom: 20,
    width: "70%",
  },
  darkSubtitle: {
    color: "#fff",
  },
  pressCards: {
    marginBottom: 15,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  quickAcc: {
    marginTop: 40,
    fontSize: 20,
    fontWeight: "600",
  },
  visitorList: {
    width: "85%",
    marginTop: 10,
    marginBottom: 10,
  },
  visitorItem: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  visitorName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  visitorDetail: {
    fontSize: 14,
    color: "#666",
  },
});