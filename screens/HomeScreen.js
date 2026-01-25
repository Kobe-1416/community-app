// screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import CodeCard from "../components/CodeCard";
import ContributionsBar from "../components/ContributionBar";
import Card from "../components/Card";
import PressableCard from "../components/PressableCard";
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://10.0.2.2:3000"; // <-- change to your PC IP (e.g. http://192.168.8.107) when testing on a real device
const DASHBOARD_ENDPOINT = `${BASE_URL}/api/dashboard`;
const DASHBOARD_CACHE_KEY = "dashboardCache_v1";

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    gateCode: null,
    contributions: { current: 0, total: 1 },
    visitorsTotal: 0,
    visitorsInside: 0,
    visitorsList: [],
    marketplaceCount: 0,
    announcementsCount: 0,
  });

  const [showVisitorsTotal, setshowVisitorsTotal] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);

  // Load cached dashboard first, then refresh from server
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // 1) load cache
      try {
        const cached = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
        if (cached && mounted) {
          setDashboard(JSON.parse(cached));
        }
      } catch (err) {
        console.warn("Failed to read dashboard cache", err);
      }

      // 2) fetch fresh data
      await fetchDashboard();
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // fetch dashboard from backend
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        // Not authenticated
        Alert.alert("Not authenticated", "Please login again.");
        setLoading(false);
        return;
      }

      const resp = await fetch(DASHBOARD_ENDPOINT, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!resp.ok) {
        // handle 401/403/others gracefully
        if (resp.status === 401) {
          Alert.alert("Session expired", "Please log in again.");
          // optionally navigate to login
          // navigation.replace("Login");
        } else {
          console.warn("Failed to fetch dashboard", resp.status);
        }
        setLoading(false);
        return;
      }

      const data = await resp.json();

      // assume `data` comes in right shape; map it into our UI state
      const mapped = {
        gateCode: data.gateCode || null,
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

      // cache for offline use
      try {
        await AsyncStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(mapped));
      } catch (err) {
        console.warn("Failed to cache dashboard", err);
      }
    } catch (err) {
      console.error("Network error fetching dashboard", err);
      // keep cached data if any
    } finally {
      setLoading(false);
    }
  };

  // destructure dashboard for easy use in JSX
  const {
    gateCode,
    contributions,
    visitorsTotal,
    visitorsInside,
    visitorsList,
    marketplaceCount,
    announcementsCount,
  } = dashboard;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <CodeCard
        largeText={gateCode ? gateCode : "—"}
        smallText={gateCode ? "expires: 7 days" : "no code available"}
      />

      <Text style={styles.subtitle}>
        Give the guard the code to exit and enter the community.
      </Text>

      <ContributionsBar current={contributions.current} total={contributions.total} />

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
            .filter((v) => !v.exit_time) // items still inside
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
    paddingBottom: 30, // Add bottom padding
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
