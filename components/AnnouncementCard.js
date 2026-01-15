// components/AnnouncementCard.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AnnouncementCard({ announcement }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.date}>{announcement.date}</Text>
      <Text style={styles.content}>{announcement.content}</Text>
    </View>
  );
}