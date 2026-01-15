import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Pressable, 
  TextInput,
  ScrollView,
  Image,
  Alert
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function CreateListingScreen({ navigation, route }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = () => {
    if (!title || !price || !description || !phone) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    if (images.length < 3) {
      Alert.alert('Not enough images', 'Please add at least 3 images');
      return;
    }

    const newListing = {
      id: Date.now().toString(),
      title: title.trim(),
      price: parseFloat(price) || 0,
      description: description.trim(),
      phone: phone.trim(),
      date: new Date().toISOString(),
      isNew: true,
      images: images,
      thumbnail: images[0] || `https://via.placeholder.com/300x200/85FF27/000000?text=${encodeURIComponent(title)}`,
    };

    // If a callback was passed via navigation params, call it
    if (route?.params?.onCreate && typeof route.params.onCreate === 'function') {
      route.params.onCreate(newListing);
    }

    Alert.alert('Success', 'Listing created successfully!');
    navigation.goBack();
  };

  const addImage = () => {
    if (images.length >= 8) {
      Alert.alert('Maximum Reached', 'You can only upload up to 8 images');
      return;
    }
    // Simulate image picker
    setImages([...images, `https://via.placeholder.com/300x200/85FF27/000000?text=Image+${images.length + 1}`]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Create New Listing</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Images (3-8 required)</Text>
        <View style={styles.imageGrid}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: img }} style={styles.image} />
              <Pressable style={styles.removeImage} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={24} color="#ff4444" />
              </Pressable>
            </View>
          ))}
          
          {images.length < 8 && (
            <Pressable style={styles.addImageButton} onPress={addImage}>
              <Ionicons name="add" size={30} color="#85FF27" />
              <Text style={styles.addImageText}>Add Image</Text>
              <Text style={styles.imageCount}>{images.length}/8</Text>
            </Pressable>
          )}
        </View>
        <Text style={[styles.helperText, { color: images.length < 3 ? '#ff4444' : '#85FF27' }]}>
          {images.length < 3 ? `Need ${3 - images.length} more images` : '✓ Minimum images met'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Listing Details</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Title (e.g., iPhone 13 Pro)"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#888"
        />
        
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>R</Text>
          <TextInput
            style={[styles.input, styles.priceInput]}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholderTextColor="#888"
          />
        </View>
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (Be detailed about condition, features, etc.)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor="#888"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Your phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#888"
        />
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Publish Listing</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 25, textAlign: 'center' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 15 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  imageContainer: { width: '48%', marginBottom: 10, position: 'relative' },
  image: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#e0e0e0' },
  removeImage: { position: 'absolute', top: -5, right: -5 },
  addImageButton: {
    width: '48%',
    height: 120,
    borderWidth: 2,
    borderColor: '#85FF27',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: { marginTop: 5, color: '#85FF27', fontSize: 14 },
  imageCount: { fontSize: 12, color: '#888', marginTop: 3 },
  helperText: { fontSize: 14, marginTop: 10 },
  input: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 15, fontSize: 16, color: '#333', marginBottom: 15 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  currency: { fontSize: 18, fontWeight: 'bold', color: '#85FF27', marginRight: 10, width: 30 },
  priceInput: { flex: 1 },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#85FF27', borderRadius: 10, padding: 18, alignItems: 'center', marginBottom: 30 },
  submitText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});
