import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Pressable, 
  ScrollView,
  TextInput,
  Switch,
  Alert,
  TouchableOpacity
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  // State for settings
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotifications, setIsNotifications] = useState(true);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingPhone, setIsChangingPhone] = useState(false);

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    // Here you would call API to change password
    Alert.alert('Success', 'Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
  };

  const handleChangePhone = () => {
    if (newPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    // Here you would call API to change phone number
    Alert.alert('Success', 'Phone number updated');
    setNewPhone('');
    setIsChangingPhone(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })}
      ]
    );
  };

  const SettingItem = ({ icon, title, rightComponent, onPress }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={22} color="#85FF27" />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {rightComponent}
    </Pressable>
  );

  return (
    <ScrollView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.header, isDarkMode && styles.darkText]}>Settings</Text>

      {/* Account Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Account</Text>
        
        <SettingItem
          icon="person-outline"
          title="Change Password"
          rightComponent={<Ionicons name="chevron-forward" size={20} color="#666" />}
          onPress={() => setIsChangingPassword(!isChangingPassword)}
        />

        {isChangingPassword && (
          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Current Password"
              placeholderTextColor={isDarkMode ? "#888" : "#999"}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="New Password"
              placeholderTextColor={isDarkMode ? "#888" : "#999"}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="Confirm New Password"
              placeholderTextColor={isDarkMode ? "#888" : "#999"}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsChangingPassword(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <SettingItem
          icon="call-outline"
          title="Change Phone Number"
          rightComponent={<Ionicons name="chevron-forward" size={20} color="#666" />}
          onPress={() => setIsChangingPhone(!isChangingPhone)}
        />

        {isChangingPhone && (
          <View style={styles.formContainer}>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              placeholder="New Phone Number"
              placeholderTextColor={isDarkMode ? "#888" : "#999"}
              keyboardType="phone-pad"
              value={newPhone}
              onChangeText={setNewPhone}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsChangingPhone(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleChangePhone}
              >
                <Text style={styles.saveText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Preferences Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Preferences</Text>
        
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          rightComponent={
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#767577', true: '#85FF27' }}
              thumbColor={isDarkMode ? '#000' : '#f4f3f4'}
            />
          }
        />

        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          rightComponent={
            <Switch
              value={isNotifications}
              onValueChange={setIsNotifications}
              trackColor={{ false: '#767577', true: '#85FF27' }}
              thumbColor={isNotifications ? '#000' : '#f4f3f4'}
            />
          }
        />
      </View>

      {/* More Section */}
      <View style={[styles.section, isDarkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>More</Text>
        
        <SettingItem
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          rightComponent={<Ionicons name="chevron-forward" size={20} color="#666" />}
          onPress={() => Alert.alert('Privacy Policy', 'Coming soon...')}
        />

        <SettingItem
          icon="document-text-outline"
          title="Terms of Service"
          rightComponent={<Ionicons name="chevron-forward" size={20} color="#666" />}
          onPress={() => Alert.alert('Terms of Service', 'Coming soon...')}
        />

        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          rightComponent={<Ionicons name="chevron-forward" size={20} color="#666" />}
          onPress={() => Alert.alert('Support', 'Contact: support@communityapp.co.za')}
        />
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ff4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <Pressable 
          style={[styles.logoutButton, { marginTop: 10 }]} 
          onPress={() => Alert.alert(
            'Delete Account',
            'This action cannot be undone. All your data will be permanently deleted.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive' }
            ]
          )}
        >
          <Ionicons name="trash-outline" size={22} color="#ff4444" />
          <Text style={styles.logoutText}>Delete Account</Text>
        </Pressable>
      </View>

      {/* App Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.versionText, isDarkMode && styles.darkText]}>Community App</Text>
        <Text style={[styles.versionNumber, isDarkMode && styles.darkText]}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
  },
  darkText: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkSection: {
    backgroundColor: '#1e1e1e',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  formContainer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  darkInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#85FF27',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  saveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff4444',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '500',
    marginLeft: 15,
  },
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginBottom: 5,
  },
  versionNumber: {
    fontSize: 14,
    color: '#888',
  },
});