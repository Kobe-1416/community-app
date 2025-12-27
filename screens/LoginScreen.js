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
import Header from "../components/Header"

export default function LoginScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>  
      {/* <Text style={styles.title}>CommunityApp</Text> */}
      <Header title="CommunityApp"></Header>

      <View style={styles.containerInput}>
        <TextInput style={styles.input}
          placeholder="Cellphone"
          keyboardType="numeric"/>
          <TextInput style={styles.input} placeholder="Password" secureTextEntry/>

            <Button title="Login" onPress={() => navigation.replace("MainTabs")}/>
              
          <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.createAcc}>Don't have an account?{"\n"}
            Register
          </Text>
          </Pressable>
          
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containter: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  containerInput: {
    justifyContent: "center",
    height: "100%",
    alignItems: "center",
    marginTop: "5%",

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
  button:{
    backgroundColor: "#85FF27",
    padding: 15,
    borderRadius: 25,
    width: "60%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000000ff",
    fontWeight: "bold",
    fontSize: 16,
  },
  createAcc: {
    textAlign: 'center',
    marginTop: 15,
  }
});

