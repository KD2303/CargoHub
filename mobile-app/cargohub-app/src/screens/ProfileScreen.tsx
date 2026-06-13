import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image, Linking, TextInput, Modal, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useDriver } from '../context/DriverContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LogOut as LogOutIcon, ChevronRight as ChevronRightIcon, ShieldCheck as ShieldCheckIcon, 
  Bell as BellIcon, HelpCircle as HelpCircleIcon, FileText as FileTextIcon, Camera as CameraIcon, Edit2 as Edit2Icon, 
  Star as StarIcon, Calendar as CalendarIcon, Truck as TruckIcon, X as XIcon, Moon as MoonIcon 
} from 'lucide-react-native';

const LogOut = LogOutIcon as any;
const ChevronRight = ChevronRightIcon as any;
const ShieldCheck = ShieldCheckIcon as any;
const Bell = BellIcon as any;
const HelpCircle = HelpCircleIcon as any;
const FileText = FileTextIcon as any;
const Camera = CameraIcon as any;
const Edit2 = Edit2Icon as any;
const Star = StarIcon as any;
const Calendar = CalendarIcon as any;
const Truck = TruckIcon as any;
const X = XIcon as any;
const Moon = MoonIcon as any;
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';

export const ProfileScreen = ({ navigation }: any) => {
  const { logout, updateProfile } = useAuth();
  const { driver, refreshDriverData } = useDriver();
  const { themeMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(driver?.name || '');
  const [editPhone, setEditPhone] = useState(driver?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const kycStatus = driver?.kycStatus || 'NOT_SUBMITTED';

  const handleUpdateAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your avatar.');
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
      Alert.alert('Success', 'Profile photo updated successfully!');
    }
  };

  const handleEditVehicle = () => {
    Alert.alert(
      'Edit Vehicle Details',
      'To update your registered vehicle type, model, or plate number, please contact driver support.',
      [{ text: 'Cancel' }, { text: 'Contact Support', onPress: () => Linking.openURL('tel:+919999988888') }]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Support & Help',
      'Need support?\n\n📞 Call: +91 99999 88888\n📧 Email: support@cargohub.app',
      [{ text: 'OK' }]
    );
  };

  const handleTermsPrivacy = () => {
    Alert.alert(
      'Terms & Privacy',
      'CargoHub driver partner agreement and privacy policies apply. Version 2.1.0.',
      [{ text: 'Close' }]
    );
  };

  const getKycColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return '#38BDF8';
      case 'PENDING': return '#F5A623';
      case 'REJECTED': return '#E53935';
      default: return '#6B7280';
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
        await refreshDriverData();
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Large avatar section with camera overlay */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleUpdateAvatar} activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{driver?.name?.[0] || 'D'}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Camera size={14} color="white" />
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Text style={styles.driverName}>{driver?.name || 'Driver Partner'}</Text>
            <TouchableOpacity onPress={() => { setEditName(driver?.name || ''); setEditPhone(driver?.phone || ''); setIsEditModalVisible(true); }} style={{ marginLeft: 8, padding: 4 }}>
              <Edit2 size={16} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.driverPhone}>{driver?.phone || '+91 99999 99999'}</Text>
        </View>

        {/* 2. Stats Row (Trips, Rating, Member Since) */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{driver?.earnings?.tripCount || 28}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statColBorder}>
            <View style={styles.ratingWrapper}>
              <Text style={styles.statVal}>{driver?.rating || '4.8'}</Text>
              <Star size={14} color="#F5A623" fill="#F5A623" style={{ marginLeft: 2, marginBottom: 2 }} />
            </View>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>May '26</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* 3. KYC Status Card */}
        <TouchableOpacity 
          style={styles.kycCard} 
          onPress={() => navigation.navigate('KycUpload')}
          activeOpacity={0.8}
        >
          <View style={styles.kycCardLeft}>
            <ShieldCheck size={22} color={getKycColor(kycStatus)} />
            <View style={styles.kycCardText}>
              <Text style={styles.kycCardTitle}>KYC Status</Text>
              <Text style={[styles.kycCardStatus, { color: getKycColor(kycStatus) }]}>
                {kycStatus.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={theme.colors.text.muted} />
        </TouchableOpacity>

        {/* 4. Vehicle Details Section with Edit Icon */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleCardHeader}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            <TouchableOpacity onPress={handleEditVehicle} style={styles.editBtn}>
              <Edit2 size={16} color={theme.colors.brand.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleDetailCol}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{driver?.vehicleType?.replace('_', ' ') || 'TATA ACE'}</Text>
            </View>
            <View style={styles.vehicleDetailCol}>
              <Text style={styles.detailLabel}>Make/Model</Text>
              <Text style={styles.detailValue}>Tata Ace Gold</Text>
            </View>
            <View style={styles.vehicleDetailCol}>
              <Text style={styles.detailLabel}>Plate Number</Text>
              <Text style={styles.detailValue}>{driver?.vehicleNumber || 'MH 12 AB 1234'}</Text>
            </View>
          </View>
        </View>

        {/* 5. Settings rows */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsContainer}>
            {/* Notification Row */}
            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => navigation.navigate('NotificationSettings')} 
              activeOpacity={0.8}
            >
              <View style={styles.settingLeft}>
                <Bell size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingTitle}>Push Notifications</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>

            {/* Theme Toggle Row */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Moon size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingTitle}>Dark Mode</Text>
              </View>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border.subtle, true: 'rgba(56, 189, 248, 0.3)' }}
                thumbColor={themeMode === 'dark' ? theme.colors.brand.primary : '#f4f3f4'}
              />
            </View>

            {/* Help & Support */}
            <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport} activeOpacity={0.8}>
              <View style={styles.settingLeft}>
                <HelpCircle size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingTitle}>Help & Support</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>

            {/* Terms & Privacy */}
            <TouchableOpacity style={styles.settingItem} onPress={handleTermsPrivacy} activeOpacity={0.8}>
              <View style={styles.settingLeft}>
                <FileText size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingTitle}>Terms & Privacy</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Outlined Log Out button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={20} color={theme.colors.brand.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.text.muted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholder="Enter your phone number"
                placeholderTextColor={theme.colors.text.muted}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={handleUpdateProfile}
              disabled={isUpdating}
            >
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
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  
  // Avatar Section
  avatarSection: { alignItems: 'center', marginVertical: theme.spacing.md },
  avatarWrapper: { position: 'relative' },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: theme.colors.border.subtle },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(216, 90, 48, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.brand.primary },
  avatarText: { fontFamily: theme.typography.display.fontFamily, fontSize: 36, color: theme.colors.brand.primary, fontWeight: 'bold' },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.brand.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.background.primary },
  driverName: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 20, color: theme.colors.text.primary, fontWeight: 'bold', marginTop: 12 },
  driverPhone: { fontFamily: theme.typography.body.fontFamily, fontSize: 14, color: theme.colors.text.muted, marginTop: 4 },
  
  // Stats Row
  statsRow: { flexDirection: 'row', backgroundColor: theme.colors.background.card, borderRadius: theme.radius.lg, paddingVertical: 16, borderWidth: 1, borderColor: theme.colors.border.subtle, marginVertical: theme.spacing.lg, ...theme.shadows.xs },
  statCol: { flex: 1, alignItems: 'center' },
  statColBorder: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: theme.colors.border.subtle },
  ratingWrapper: { flexDirection: 'row', alignItems: 'center' },
  statVal: { fontFamily: theme.typography.mono.fontFamily, fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary },
  statLabel: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 11, color: theme.colors.text.muted, marginTop: 4 },
  
  // KYC Card
  kycCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.background.card, padding: theme.spacing.md, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, marginBottom: theme.spacing.lg, ...theme.shadows.xs },
  kycCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kycCardText: { gap: 2 },
  kycCardTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text.primary },
  kycCardStatus: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },

  // Vehicle Details Card
  vehicleCard: { backgroundColor: theme.colors.background.card, padding: theme.spacing.lg, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, marginBottom: theme.spacing.lg, ...theme.shadows.xs },
  vehicleCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 13, color: theme.colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' },
  editBtn: { padding: 4 },
  vehicleInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  vehicleDetailCol: { flex: 1 },
  detailLabel: { fontFamily: theme.typography.body.fontFamily, fontSize: 11, color: theme.colors.text.muted },
  detailValue: { fontFamily: theme.typography.mono.fontFamily, fontSize: 14, fontWeight: 'bold', color: theme.colors.text.primary, marginTop: 4 },

  // Settings
  settingsSection: { marginBottom: theme.spacing.xl },
  settingsContainer: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, overflow: 'hidden', marginTop: 8 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingTitle: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 14, color: theme.colors.text.primary },
  
  // Log Out button
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 14, borderWidth: 1.5, borderColor: theme.colors.brand.danger, borderRadius: theme.radius.full, marginBottom: 20 },
  logoutText: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 15, color: theme.colors.brand.danger, fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.background.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: theme.spacing.xl, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text.primary },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: theme.colors.text.secondary, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: theme.colors.background.card, borderWidth: 1, borderColor: theme.colors.border.subtle, borderRadius: theme.radius.lg, padding: 16, fontSize: 16, color: theme.colors.text.primary },
  saveBtn: { backgroundColor: theme.colors.brand.primary, padding: 16, borderRadius: theme.radius.full, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
