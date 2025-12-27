import { 
  View, 
  StyleSheet, 
  TextInput, 
  Text, 
  Pressable, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform 
} from "react-native";
import Button from "../components/Button"
import Header from "../components/Header"

export default function RegisterScreen({ navigation }) {
  return(
    <ScrollView>
      {/* <Text style={styles.title}>Register</Text> */}
      <Header title="CommunityApp"></Header>
      <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Surname"/>
      <TextInput style={styles.input} placeholder="House Number"/>
      <TextInput style={styles.input} placeholder="Street Name"/>
      <TextInput style={styles.input} placeholder="Cellphone Number" keyboardType="numeric"/>
      <TextInput style={styles.input} placeholder="Password" secureTextEntry/>
      <Button title="Register" onPress={() => navigation.replace("MainTabs")}/>
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