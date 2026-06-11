import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image, Linking } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut as LogOutIcon, ChevronRight as ChevronRightIcon,
  Bell as BellIcon, HelpCircle as HelpCircleIcon, FileText as FileTextIcon, Camera as CameraIcon,
  Star as StarIcon, Clock as ClockIcon
} from 'lucide-react-native';

const LogOut = LogOutIcon as any;
const ChevronRight = ChevronRightIcon as any;
const Bell = BellIcon as any;
const HelpCircle = HelpCircleIcon as any;
const FileText = FileTextIcon as any;
const Camera = CameraIcon as any;
const Star = StarIcon as any;
const Clock = ClockIcon as any;
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen = ({ navigation }: any) => {
  const { logout, user, updateProfile } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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
      // Ideally, upload to backend here.
      Alert.alert('Success', 'Profile photo updated successfully!');
    }
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
      'CargoHub customer agreement and privacy policies apply. Version 2.1.0.',
      [{ text: 'Close' }]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Large avatar section with camera overlay */}
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
          <Text style={styles.customerName}>{user?.name || 'Customer'}</Text>
          <Text style={styles.customerPhone}>{user?.phone || '+91 99999 99999'}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>12</Text>
            <Text style={styles.statLabel}>Total Rides</Text>
          </View>
          <View style={styles.statColBorder}>
            <View style={styles.ratingWrapper}>
              <Text style={styles.statVal}>4.9</Text>
              <Star size={14} color="#F5A623" fill="#F5A623" style={{ marginLeft: 2, marginBottom: 2 }} />
            </View>
            <Text style={styles.statLabel}>My Rating</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>May '26</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* Settings rows */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsContainer}>
            {/* Notification Row with Switch */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={20} color={theme.colors.text.secondary} />
                <Text style={styles.settingTitle}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.colors.border.subtle, true: 'rgba(216, 90, 48, 0.3)' }}
                thumbColor={notificationsEnabled ? theme.colors.brand.primary : '#f4f3f4'}
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

        {/* Outlined Log Out button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <LogOut size={20} color={theme.colors.brand.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  customerName: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 20, color: theme.colors.text.primary, fontWeight: 'bold', marginTop: 12 },
  customerPhone: { fontFamily: theme.typography.body.fontFamily, fontSize: 14, color: theme.colors.text.muted, marginTop: 4 },
  
  // Stats Row
  statsRow: { flexDirection: 'row', backgroundColor: theme.colors.background.card, borderRadius: theme.radius.lg, paddingVertical: 16, borderWidth: 1, borderColor: theme.colors.border.subtle, marginVertical: theme.spacing.lg, ...theme.shadows.xs },
  statCol: { flex: 1, alignItems: 'center' },
  statColBorder: { flex: 1, alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, borderColor: theme.colors.border.subtle },
  ratingWrapper: { flexDirection: 'row', alignItems: 'center' },
  statVal: { fontFamily: theme.typography.mono.fontFamily, fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary },
  statLabel: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 11, color: theme.colors.text.muted, marginTop: 4 },
  
  // Settings
  settingsSection: { marginBottom: theme.spacing.xl },
  settingsContainer: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, overflow: 'hidden', marginTop: 8 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingTitle: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 14, color: theme.colors.text.primary },
  sectionTitle: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 13, color: theme.colors.text.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' },
  
  // Log Out button
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 14, borderWidth: 1.5, borderColor: theme.colors.brand.danger, borderRadius: theme.radius.full, marginBottom: 20 },
  logoutText: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 15, color: theme.colors.brand.danger, fontWeight: 'bold' },
});
