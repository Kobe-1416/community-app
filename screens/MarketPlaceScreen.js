import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Pressable, 
  Image,
  FlatList,
  TextInput
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function MarketPlaceScreen({ navigation }) {
  const [listings, setListings] = useState([
    // ... your initial items (same as before)
    {
      id: '1',
      title: 'iPhone 13 Pro',
      price: 12500,
      description: '256GB, Blue, Excellent condition with box and accessories',
      phone: '071 234 5678',
      date: '2024-12-15',
      isNew: true,
      images: ['https://via.placeholder.com/300x200/85FF27/000000?text=iPhone'],
      thumbnail: 'https://via.placeholder.com/300x200/85FF27/000000?text=iPhone'
    },
    {
      id: '2',
      title: 'Sofa Set',
      price: 4500,
      description: '3-seater sofa in grey fabric, good condition',
      phone: '082 345 6789',
      date: '2024-12-14',
      isNew: false,
      images: ['https://via.placeholder.com/300x200/CCCCCC/000000?text=Sofa'],
      thumbnail: 'https://via.placeholder.com/300x200/CCCCCC/000000?text=Sofa'
    },
    {
      id: '3',
      title: 'Gaming Laptop',
      price: 18900,
      description: 'RTX 4070, i7 13th gen, 16GB RAM, 1TB SSD',
      phone: '083 456 7890',
      date: '2024-12-13',
      isNew: true,
      images: ['https://via.placeholder.com/300x200/85FF27/000000?text=Laptop'],
      thumbnail: 'https://via.placeholder.com/300x200/85FF27/000000?text=Laptop'
    },
    {
      id: '4',
      title: 'Bicycle',
      price: 2500,
      description: 'Mountain bike, 21 gears, recently serviced',
      phone: '084 567 8901',
      date: '2024-12-12',
      isNew: false,
      images: ['https://via.placeholder.com/300x200/CCCCCC/000000?text=Bike'],
      thumbnail: 'https://via.placeholder.com/300x200/CCCCCC/000000?text=Bike'
    },
  ]);

  // Format date as "2 days ago", "Yesterday", etc.
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    return `${diffDays} days ago`;
  };

  const ListingCard = ({ item }) => (
    <Pressable 
      style={styles.card}
      onPress={() => {/* Navigate to detailed view if you add one later */}}
    >
      {item.isNew && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.price}>R{item.price.toLocaleString()}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.phone}>{item.phone}</Text>
          </View>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search marketplace..."
          placeholderTextColor="#888"
        />
      </View>

      <FlatList
        data={listings}
        renderItem={({ item }) => <ListingCard item={item} />}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Pressable 
        style={styles.addButton}
        onPress={() =>
          // Pass a callback which CreateListing will call with the new listing
          navigation.navigate('CreateListing', {
            onCreate: (newListing) => {
              setListings(prev => [newListing, ...prev]);
            }
          })
        }
      >
        <Ionicons name="add" size={32} color="#000" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 16, color: '#333' },
  listContainer: { paddingHorizontal: 10, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#85FF27', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, zIndex: 1 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#000' },
  thumbnail: { width: '100%', height: 140, backgroundColor: '#e0e0e0' },
  cardContent: { padding: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', color: '#000', flex: 1, marginRight: 8 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#85FF27' },
  description: { fontSize: 14, color: '#666', lineHeight: 18, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  phone: { fontSize: 13, color: '#666', marginLeft: 5 },
  date: { fontSize: 12, color: '#888' },
  addButton: {
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
