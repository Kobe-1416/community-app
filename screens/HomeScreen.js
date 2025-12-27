// screens/HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable} from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    
    <View style={styles.container}>

      <Image source={require("../assets/icon.png")} style={styles.logo} />
      
      <Text style={styles.title}>Welcome to CommunityApp</Text>
      <Text style={styles.subtitle}>
        Register residents, browse the marketplace and read announcements.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Notice Board")}
      >
        <Text style={styles.buttonText}>Go to Notice Board</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.ghost]}
        onPress={() => navigation.navigate("Market Place")}
      >
        <Text style={[styles.buttonText, styles.ghostText]}>Browse Marketplace</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 20,
    position: "relative",
  },
  logo: { 
    width: 140, 
    height: 140, 
    marginBottom: 18, 
    resizeMode: "contain" },
  title: { 
    fontSize: 24, 
    fontWeight: "700", 
    marginBottom: 8, 
    textAlign: "center" },
  subtitle: { 
    fontSize: 14, 
    color: "#444", 
    textAlign: "center", 
    marginBottom: 20 },
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
  ghostText: { color: "#000000ff" },
});
