import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Card component

const Card = ({ Text1, Text2 }) => (
  <View style={styles.card}>
    <Text style={styles.Text1}>{Text1}</Text>
    <Text style={styles.Text2}>{Text2}</Text>
  </View>
);

const styles = StyleSheet.create({
    card:{
        backgroundColor: '#d6d6d6',
        padding: 15,
        borderRadius: 25,
        width: '85%',
        height: 70,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 5,
        borderWidth: 1,           // Add this
        borderColor: '#c7c7c7'
    },
    Text1:{
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'fit-content',
    },
    Text2:{
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'fit-content',
    }
});

export default Card;