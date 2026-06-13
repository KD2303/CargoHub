import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal, ActivityIndicator, TextInput, Switch } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LogOut as LogOutIcon, ChevronRight as ChevronRightIcon, Bell as BellIcon,
  HelpCircle as HelpCircleIcon, Info as InfoIcon, CreditCard as CreditCardIcon, MapPin as MapPinIcon, Camera as CameraIcon, Edit2 as Edit2Icon, X as XIcon, Plus as PlusIcon,
  Moon as MoonIcon
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';

const LogOut = LogOutIcon as any;
const ChevronRight = ChevronRightIcon as any;
const Bell = BellIcon as any;
const HelpCircle = HelpCircleIcon as any;
const Info = InfoIcon as any;
const CreditCard = CreditCardIcon as any;
const MapPin = MapPinIcon as any;
const Camera = CameraIcon as any;
const Edit2 = Edit2Icon as any;
const X = XIcon as any;
const Plus = PlusIcon as any;
const Moon = MoonIcon as any;

export const CustomerProfileScreen = ({ navigation }: any) => {
  const { logout, user, updateProfile } = useAuth();
  const { themeMode, toggleTheme } = useTheme();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera roll permissions needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
      Alert.alert('Success', 'Profile photo updated!');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Error', 'Name and phone cannot be empty.');
      return;
    }
    setIsUpdating(true);
    try {
      const response = await api.put('/auth/me', { name: editName, phone: editPhone });
      if (response.data?.success) {
        updateProfile({ name: editName, phone: editPhone });
        setIsEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header: Avatar, Name, Email, "Joined" */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleUpdateAvatar} activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Camera size={14} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.nameRow}>
            <Text style={styles.customerName}>{user?.name || 'Customer'}</Text>
            <TouchableOpacity onPress={() => { setEditName(user?.name || ''); setEditPhone(user?.phone || ''); setIsEditModalVisible(true); }} style={styles.editBtn}>
              <Edit2 size={16} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.customerEmail}>{user?.email || 'customer@fleetora.com'}</Text>
          <Text style={styles.joinedText}>Joined Oct 2023</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>42</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statColBorder}>
            <Text style={styles.statVal}>₹12.5k</Text>
            <Text style={styles.statLabel}>Amount Spent</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>4.9 ★</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Saved Addresses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Addresses</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CustomerAddresses')}>
              <Plus size={20} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color={theme.colors.brand.primary} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Home</Text>
              <Text style={styles.listSub} numberOfLines={1}>Block A, Cyber Hub, Gurugram</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color={theme.colors.brand.primary} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Office</Text>
              <Text style={styles.listSub} numberOfLines={1}>Sector 62, Noida, UP</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
          
          <TouchableOpacity style={{ marginTop: 8 }} onPress={() => navigation.navigate('CustomerAddresses')}>
            <Text style={{ color: theme.colors.brand.primary, fontWeight: 'bold' }}>Manage Addresses →</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Methods</Text>
            <TouchableOpacity>
              <Plus size={20} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.iconCircle}>
              <CreditCard size={18} color={theme.colors.brand.secondary} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>HDFC Credit Card</Text>
              <Text style={styles.listSub}>**** **** **** 4242</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <View style={styles.iconCircle}>
              <CreditCard size={18} color={theme.colors.brand.secondary} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>Google Pay UPI</Text>
              <Text style={styles.listSub}>user@okaxis</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Settings Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => navigation.navigate('NotificationSettings')} 
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Bell size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>

            {/* Theme Toggle Row */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Moon size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border.subtle, true: 'rgba(56, 189, 248, 0.3)' }}
                thumbColor={themeMode === 'dark' ? theme.colors.brand.primary : '#f4f3f4'}
              />
            </View>

            <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('CustomerSupport')} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <HelpCircle size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingText}>Support</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <Info size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingText}>About</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]} onPress={logout} activeOpacity={0.7}>
              <View style={styles.settingLeft}>
                <LogOut size={20} color={theme.colors.brand.danger} />
                <Text style={[styles.settingText, { color: theme.colors.brand.danger }]}>Log Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <X size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholderTextColor={theme.colors.text.muted} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" placeholderTextColor={theme.colors.text.muted} />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateProfile} disabled={isUpdating}>
              {isUpdating ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: theme.colors.border.subtle },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: theme.colors.background.tertiary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.brand.primary },
  avatarText: { fontSize: 36, color: theme.colors.brand.primary, fontWeight: 'bold' },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.brand.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.background.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  customerName: { fontSize: 20, color: theme.colors.text.primary, fontWeight: 'bold' },
  editBtn: { marginLeft: 8, padding: 4 },
  customerEmail: { fontSize: 14, color: theme.colors.text.muted, marginBottom: 4 },
  joinedText: { fontSize: 12, color: theme.colors.brand.primary, fontWeight: '500', backgroundColor: 'rgba(55, 138, 221, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  
  statsRow: { flexDirection: 'row', backgroundColor: theme.colors.background.card, borderRadius: theme.radius.lg, paddingVertical: 16, borderWidth: 1, borderColor: theme.colors.border.subtle, marginBottom: 32 },
  statCol: { flex: 1, alignItems: 'center' },
  statColBorder: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: theme.colors.border.subtle },
  statVal: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: theme.colors.text.muted },
  
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 14, color: theme.colors.text.muted, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 8 },
  
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background.card, padding: 16, borderRadius: theme.radius.md, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border.subtle },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background.tertiary, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  listContent: { flex: 1 },
  listTitle: { fontSize: 15, color: theme.colors.text.primary, fontWeight: '600', marginBottom: 4 },
  listSub: { fontSize: 13, color: theme.colors.text.muted },
  
  settingsCard: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border.subtle, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 15, color: theme.colors.text.primary, fontWeight: '500' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.background.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text.primary },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: theme.colors.text.secondary, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: theme.colors.background.card, borderWidth: 1, borderColor: theme.colors.border.subtle, borderRadius: theme.radius.lg, padding: 16, fontSize: 16, color: theme.colors.text.primary },
  saveBtn: { backgroundColor: theme.colors.brand.primary, padding: 16, borderRadius: theme.radius.full, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
