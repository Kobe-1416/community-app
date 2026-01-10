// screens/HomeScreen.js
import React from "react";
import CodeCard from "../components/CodeCard";
import ContributionsBar from "../components/ContributionBar";
import Card from "../components/Card";
import PressableCard from "../components/PressableCard";
import { ScrollView, View, Text, StyleSheet, Image, Pressable} from "react-native";

export default function HomeScreen({ navigation }) {
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
      <Card Text1="Total Visitors: " Text2="17" />
      <Card Text1="Still Inside: " Text2="5" />
      
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
    fontWeight: "600" },
  ghost: { 
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#85FF27" },
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
  ghostText: { color: "#000000ff" },
});
