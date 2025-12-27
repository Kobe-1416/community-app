import React from "react";
import {TouchableOpacity, Text, Pressable, StyleSheet} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function Button({title, onPress, color = "#85FF27"}){
    return (
            <Pressable style={[styles.button, { backgroundColor: color}]}
            onPress={onPress}>
                <Text style={styles.buttonText}>{title}</Text>      
            </Pressable>
        );
}

const styles = StyleSheet.create({
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
    fontSize: 18,
  },
});