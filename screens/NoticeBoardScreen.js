import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  Text, 
  Pressable, 
  ScrollView, 
  Platform,
  FlatList
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function NoticeBoardScreen() {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample announcement data
  const announcements = [
    {
      id: '1',
      title: 'Water Supply Maintenance',
      content: 'Water supply will be interrupted tomorrow from 9 AM to 3 PM for maintenance.',
      date: '2024-12-15',
      category: 'Maintenance'
    },
    {
      id: '2',
      title: 'Annual Meeting Announcement',
      content: 'Annual community meeting scheduled for December 20th at 6 PM in the clubhouse.',
      date: '2024-12-12',
      category: 'Meeting'
    },
    {
      id: '3',
      title: 'Security System Upgrade',
      content: 'New security cameras will be installed next week. Please avoid parking near the main gate.',
      date: '2024-12-10',
      category: 'Security'
    },
    {
      id: '4',
      title: 'Parking Rules Reminder',
      content: 'Please ensure your vehicles are parked in designated areas only. Violators will be fined.',
      date: '2024-12-08',
      category: 'Rules'
    },
    {
      id: '5',
      title: 'Community Clean-up Day',
      content: 'Join us this Saturday for a community clean-up. Gloves and bags will be provided.',
      date: '2024-12-05',
      category: 'Event'
    }
  ];

  // Filter announcements based on search
  const filteredAnnouncements = announcements.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Announcement Card Component
  const AnnouncementCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, 
          { backgroundColor: item.category === 'Security' ? '#ffeaa7' : 
                           item.category === 'Maintenance' ? '#a29bfe' :
                           item.category === 'Meeting' ? '#fd79a8' : '#81ecec' }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
      
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar (conditionally rendered) */}
      {searchVisible && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search announcements..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
            autoFocus={true}
          />
          <Pressable onPress={() => setSearchVisible(false)} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </Pressable>
        </View>
      )}

      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Notice Board</Text>
        <Text style={styles.subtitle}>{filteredAnnouncements.length} announcements</Text>
      </View> */}

      {/* Announcements List */}
      <FlatList
        data={filteredAnnouncements}
        renderItem={({ item }) => <AnnouncementCard item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Search Button */}
      <Pressable 
        style={styles.floatingButton}
        onPress={() => setSearchVisible(!searchVisible)}
      >
        <Ionicons 
          name={searchVisible ? "close" : "search"} 
          size={24} 
          color="#000" 
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  closeButton: {
    marginLeft: 10,
    padding: 5,
  },
  header: {
    backgroundColor: '#85FF27',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 80, // Space for floating button
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#85FF27',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
});