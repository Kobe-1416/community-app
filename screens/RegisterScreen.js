import { 
  View, 
  StyleSheet, 
  TextInput, 
  Text, 
  Pressable, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform,
} from "react-native";
import Button from "../components/Button";
import Header from "../components/Header";
import React, { useState } from "react";

  
export default function RegisterScreen({ navigation }) {
  // 1️⃣ Local state for inputs
  const [surname, setSurname] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try{
      const response = await fetch("http://192.168.43.215:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            surname,
            house_number: houseNumber,
            street_name: streetName,
            phone,
            password,
          }),
          });

      const data = await response.json();
      if(data.success){
        alert("Registration successful!");
        navigation.replace("MainTabs"); // navigate to main screen
      }
      else{
        alert(data.message);
      }
    }catch(err){
      console.error(err);
      alert("Something went wrong. Check server.");
    }
  };

  return(
    <ScrollView>
      {/* <Text style={styles.title}>Register</Text> */}
      <Header title="CommunityApp"></Header>
      <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Surname" value={surname} onChangeText={setSurname} />
      <TextInput style={styles.input} placeholder="House Number" value={houseNumber} onChangeText={setHouseNumber}/>
      <TextInput style={styles.input} placeholder="Street Name" value={streetName} onChangeText={setStreetName}/>
      <TextInput style={styles.input} placeholder="Cellphone Number" keyboardType="numeric" value={phone} onChangeText={setPhone}/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
      <Button title="Register" onPress={handleRegister}/>
      </View>
      

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginTop: "40%",
    width: "100%",
    height: 50,
    textAlign: "center",
    backgroundColor: "#85FF27",
  },
  input: {
    width: "86%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
});