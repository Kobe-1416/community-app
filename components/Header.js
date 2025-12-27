import React from "react";
import {Text, StyleSheet} from "react-native";

export default function Header({title}){
    return(
        <Text style={styles.header}>{title}</Text>
    );
}

const styles = StyleSheet.create({
    header: {
    fontSize: 34,
    fontWeight: "bold",
    marginTop: "40%",
    width: "100%",
    height: 50,
    textAlign: "center",
    backgroundColor: "#85FF27",
    }
});