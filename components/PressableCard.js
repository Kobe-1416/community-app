import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const PressableCard = ({ 
  title, 
  notificationCount = 0,
  onPress 
}) => {
  return (
    <Pressable 
      style={styles.card}
      onPress={onPress}
    >
      {notificationCount > 0 && (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationText}>{notificationCount}</Text>
        </View>
      )}
      
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#85ff27da',
    borderRadius: 16,
    paddingVertical: 30,
    width: '42%', // Half screen minus margin
    aspectRatio: 1, // Makes it square
    justifyContent: 'center',
    alignItems: 'center',
    margin: '2%',
    marginHorizontal: '2%',
    borderWidth: 1,           // Add this
  borderColor: '#c7c7c7',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PressableCard;