// screens/HomeScreen.js
import React from "react";
import CodeCard from "../components/CodeCard";
import ContributionsBar from "../components/ContributionBar";
import Card from "../components/Card";
import PressableCard from "../components/PressableCard";
import { useState } from "react";
import { ScrollView, View, Text, StyleSheet, Image, Pressable} from "react-native";

export default function HomeScreen({ navigation }) {

  const [showVisitorsTotal, setshowVisitorsTotal] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);
  
  // Sample visitor data
  const visitorsTotal = [
    { id: 1, name: "John Doe", cell: "555-0123", plate: "ABC123" },
    { id: 2, name: "Jane Smith", cell: "555-0456", plate: "XYZ789" },
    { id: 3, name: "Bob Johnson", cell: "555-0789", plate: "DEF456" },
    { id: 4, name: "Alice Brown", cell: "555-1011", plate: "GHI012" },
    { id: 5, name: "Charlie Davis", cell: "555-1213", plate: "JKL345" },
    { id: 6, name: "Eve Wilson", cell: "555-1415", plate: "MNO678" },
    { id: 7, name: "Frank Miller", cell: "555-1617", plate: "PQR901" },
    { id: 8, name: "Grace Lee", cell: "555-1819", plate: "STU234" },
    { id: 9, name: "Hank Green", cell: "555-2021", plate: "VWX567" },
    { id: 10, name: "Ivy Scott", cell: "555-2223", plate: "YZA890" },
  ];

  const visitors = [
    { id: 3, name: "Bob Johnson", cell: "555-0789", plate: "DEF456" },
    { id: 4, name: "Alice Brown", cell: "555-1011", plate: "GHI012" },
    { id: 5, name: "Charlie Davis", cell: "555-1213", plate: "JKL345" },
    { id: 8, name: "Grace Lee", cell: "555-1819", plate: "STU234" },
    { id: 9, name: "Hank Green", cell: "555-2021", plate: "VWX567" },
  ]

  return (
    
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <CodeCard largeText="CODE#" smallText="expires: 7 days" />
      
      <Text style={styles.subtitle}>
        Give the guard the code to exit and enter the community.
      </Text>
      
      <ContributionsBar current={3200} total={12300} />
      
      <Text style={styles.visitor}>Today</Text>
      <Pressable onPress={() => setshowVisitorsTotal(!showVisitorsTotal)}>
      <Card Text1="Total Visitors: " Text2="17" />
      </Pressable>
      
      {/* Visitors List - Conditionally shown */}
      {showVisitorsTotal && (
        <View style={styles.visitorList}>
          {visitorsTotal.map((visitor) => (
            <View key={visitor.id} style={styles.visitorItem}>
              <Text style={styles.visitorName}>{visitor.name}</Text>
              <Text style={styles.visitorDetail}>Cell: {visitor.cell}</Text>
              <Text style={styles.visitorDetail}>Plate: {visitor.plate}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable onPress={() => setShowVisitors(!showVisitors)}>
      <Card Text1="Still Inside: " Text2="5" />
      </Pressable>

      {showVisitors && (
        <View style={styles.visitorList}>
            {visitors.map((visitor) => (
              <View key={visitor.id} style={styles.visitorItem}>
                  <Text style={styles.visitorName}>{visitor.name}</Text>
                  <Text style={styles.visitorDetail}>Cell: {visitor.cell}</Text>
                  <Text style={styles.visitorDetail}>Plate: {visitor.plate}</Text>
              </View>
            ))}
        </View>
    )}
      
      
      <Text style={styles.quickAcc}>Quick Access</Text>
      <View style={styles.pressCards}>
        <PressableCard
          title="Market Place"
          notificationCount={3}
          onPress={() => navigation.navigate("Market Place")}
        />
        <PressableCard
          title="Notice Board"
          notificationCount={3}
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
    width: '70%' },
  button: {
    backgroundColor: "#85FF27",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    width: "80%",
  },
  buttonText: { 
    color: "#000000ff", 
    textAlign: "center", 
    fontWeight: "600" 
  },
  pressCards: {
    marginBottom: 15,
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  quickAcc: {
    marginTop: 40,
    fontSize: 20, 
    fontWeight: "600",
  },
  visitorList: {
    width: '85%',
    marginTop: 10,
    marginBottom: 10,
  },
  visitorItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  visitorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  visitorDetail: {
    fontSize: 14,
    color: '#666',
  },
});
