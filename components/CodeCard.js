import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Card component
// Card component - export directly
const CodeCard = ({ largeText, smallText }) => (
  <View style={styles.card}>
    <Text style={styles.largeText}>{largeText}</Text>
    <Text style={styles.smallText}>{smallText}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#85FF27da',
    padding: 15,
    marginBottom: 5,
    borderRadius: 35,
    alignItems: 'center',
    height: 135,
    width: '84%',
    borderWidth: 1,           // Add this
    borderColor: '#c7c7c7'
  },
  largeText: {
    fontSize: 55,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  smallText: {
    fontSize: 16,
    color: 'black',
    height: 'fit-content',
    marginTop: 2,

  },
});

export default CodeCard;