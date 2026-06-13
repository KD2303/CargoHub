// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, Alert, Dimensions } from 'react-native';
import { theme } from '../theme/theme';
import { useDriver } from '../context/DriverContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { IncomingJobModal } from './IncomingJobModal';
import { AvailableJobCard } from '../components/AvailableJobCard';
import { Header } from '../components/Header';
import { NotificationBell } from '../components/NotificationBell';
import { api } from '../services/api';
import { 
  User, Wallet, Clock, ShieldCheck, 
  HelpCircle, Play, Power, Star, Truck, MapPin 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const getKycBadgeColor = (status: string) => {
  switch (status) {
    case 'VERIFIED': return { text: '#34D399', bg: 'rgba(52, 211, 153, 0.12)' };
    case 'PENDING': return { text: '#F5A623', bg: 'rgba(245, 166, 35, 0.12)' };
    case 'REJECTED': return { text: '#F87171', bg: 'rgba(248, 113, 113, 0.12)' };
    default: return { text: '#6B7280', bg: 'rgba(107, 114, 128, 0.12)' };
  }
};

export const HomeScreen = ({ navigation }: any) => {
  const { isOnline, toggleOnlineStatus, driver, activeBooking, setActiveBooking } = useDriver();
  const { logout } = useAuth();
  const { socket } = useSocket();
  const [incomingJob, setIncomingJob] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const kycStatus = driver?.kycStatus || 'NOT_SUBMITTED';
  const kycConfig = getKycBadgeColor(kycStatus);
  const needsKycAction = kycStatus === 'REJECTED' || kycStatus === 'NOT_SUBMITTED';
  
  // Animation value for ripple scale & opacity
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0.6)).current;
  
  useEffect(() => {
    if (isOnline) {
      // Start looping pulsing ripple animation
      Animated.loop(
        Animated.parallel([
          Animated.timing(rippleScale, {
            toValue: 1.4,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      rippleScale.setValue(1);
      rippleOpacity.setValue(0.6);
    }
  }, [isOnline]);

  const handleToggleOnline = async () => {
    if (!isOnline && kycStatus !== 'VERIFIED') {
      Alert.alert(
        'KYC Pending',
        'Your profile must be verified before you can go online to accept jobs.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify KYC', onPress: () => navigation.navigate('KycUpload') }
        ]
      );
      return;
    }
    const success = await toggleOnlineStatus(!isOnline);
    if (!success) {
      Alert.alert('Status Change Failed', 'Unable to update availability. Please try again.');
    }
  };

  useEffect(() => {
    if (socket && isOnline) {
      const handleNewBooking = (booking: any) => {
        console.log('Received booking:new:', booking);
        // Show modal for new incoming job
        setIncomingJob(booking);
        setModalVisible(true);
      };
      
      socket.on('booking:new', handleNewBooking);
      return () => {
        socket.off('booking:new', handleNewBooking);
      };
    }
  }, [socket, isOnline]);

  useEffect(() => {
    if (activeBooking) {
      navigation.navigate('Job');
    }
  }, [activeBooking]);

  const handleAcceptJob = () => {
    if (socket && incomingJob) {
      socket.emit('booking:accept', { bookingId: incomingJob.id });
      setModalVisible(false);
      setActiveBooking(incomingJob);
      navigation.navigate('Job');
    }
  };

  const handleDeclineJob = () => {
    if (socket && incomingJob) {
      socket.emit('booking:reject', { bookingId: incomingJob.id });
      setModalVisible(false);
      setIncomingJob(null);
    }
  };

  const handleHelpPress = () => {
    Alert.alert(
      'CargoHub Support',
      'Need help with a trip or your account?\n\n📞 Call Support: +91 99999 88888\n📧 Email: support@cargohub.app',
      [{ text: 'OK' }]
    );
  };

  // KYC declarations moved to top

  return (
    <View style={styles.container}>
      <Header title="Dashboard" rightElement={<NotificationBell unreadCount={2} />} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
      
      {/* 1. Driver Identity Card */}
      <View style={styles.identityCard}>
        <View style={styles.identityHeader}>
          {/* Circular avatar with Initials */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {driver?.name ? driver.name.split(' ').map((n: string) => n[0]).join('') : 'D'}
            </Text>
          </View>
          
          <View style={styles.identityDetails}>
            <Text style={styles.driverName}>{driver?.name || 'Driver Partner'}</Text>
            <Text style={styles.driverPhone}>{driver?.phone || '+91 99999 99999'}</Text>
          </View>

          {/* Tappable status pill */}
          <TouchableOpacity 
            style={[
              styles.statusPill, 
              isOnline ? styles.statusPillOnline : styles.statusPillOffline
            ]}
            onPress={handleToggleOnline}
            activeOpacity={0.8}
          >
            <View style={[styles.statusDot, isOnline ? styles.statusDotOnline : styles.statusDotOffline]} />
            <Text style={[styles.statusPillText, isOnline ? styles.statusPillTextOnline : styles.statusPillTextOffline]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Today's summary preview */}
        <View style={styles.identityFooter}>
          <Text style={styles.todayPreview}>
            ₹{driver?.earnings?.today || 0} today  ·  {driver?.earnings?.tripCount || 0} trips
          </Text>
        </View>
      </View>

      {/* 2. Go Online / Offline Toggle Button with Ripple Animation */}
      <View style={styles.toggleContainer}>
        {isOnline ? (
          // ONLINE STATE (Coral/Light Blue pulse gradient)
          <View style={styles.pulseWrapper}>
            {/* Pulsing Ripple circles */}
            <Animated.View style={[
              styles.ripple, 
              { transform: [{ scale: rippleScale }], opacity: rippleOpacity }
            ]} />
            
            <TouchableOpacity 
              style={styles.onlineButton} 
              onPress={handleToggleOnline}
              activeOpacity={0.9}
            >
              <LinearGradient 
                colors={['#38BDF8', '#0284C7']} 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                style={styles.toggleGradient}
              >
                <Power size={20} color="white" />
                <Text style={styles.toggleButtonText}>You are Online 🔵</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          // OFFLINE STATE (Grey button)
          <TouchableOpacity 
            style={styles.offlineButton} 
            onPress={handleToggleOnline}
            activeOpacity={0.8}
          >
            <Power size={20} color={theme.colors.text.muted} />
            <Text style={styles.offlineButtonText}>You are Offline — tap to go online</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Quick Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{driver?.earnings?.today || 0}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{driver?.earnings?.thisWeek || 0}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{driver?.earnings?.tripCount || 0}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
      </View>

      {/* 4. Dashboard Menu Grid */}
      <View style={styles.menuGrid}>
        
        {/* Dynamic Active Job Card (Coral Highlight) - visible when activeBooking is in progress */}
        {activeBooking && (
          <TouchableOpacity 
            style={[styles.menuCard, styles.activeJobCard]} 
            onPress={() => navigation.navigate('Job')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Truck size={24} color="white" />
              </View>
              <View style={styles.activeJobBadge}>
                <Text style={styles.activeJobBadgeText}>LIVE</Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, styles.activeJobText]}>Active Job</Text>
            <Text style={[styles.cardSubtitle, styles.activeJobSubtext]}>
              Trip in progress (₹{activeBooking.finalFare || activeBooking.fareEstimate})
            </Text>
          </TouchableOpacity>
        )}

        {/* KYC Verification Card */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => navigation.navigate('KycUpload')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <ShieldCheck size={24} color={theme.colors.brand.primary} />
            </View>
            {needsKycAction && <View style={styles.redDot} />}
          </View>
          <Text style={styles.cardTitle}>KYC Verification</Text>
          <View style={[styles.kycStatusBadge, { backgroundColor: kycConfig.bg }]}>
            <Text style={[styles.kycStatusText, { color: kycConfig.text }]}>
              {kycStatus.replace('_', ' ')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Earnings Card */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => navigation.navigate('EarningsTab')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Wallet size={24} color={theme.colors.brand.primary} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Earnings</Text>
          <Text style={styles.cardSubtitle}>Wallet & accounts</Text>
        </TouchableOpacity>

        {/* Trip History Card */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => navigation.navigate('EarningsTab')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Clock size={24} color={theme.colors.brand.primary} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Trip History</Text>
          <Text style={styles.cardSubtitle}>Logs & manifests</Text>
        </TouchableOpacity>

        {/* Profile Card */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={() => navigation.navigate('ProfileTab')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <User size={24} color={theme.colors.brand.primary} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Profile</Text>
          <Text style={styles.cardSubtitle}>Vehicle & settings</Text>
        </TouchableOpacity>

        {/* Help & Support Card */}
        <TouchableOpacity 
          style={styles.menuCard} 
          onPress={handleHelpPress}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <HelpCircle size={24} color={theme.colors.brand.primary} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Help & Support</Text>
          <Text style={styles.cardSubtitle}>24/7 Helpline</Text>
        </TouchableOpacity>
        
      </View>
    </ScrollView>
    <IncomingJobModal 
      visible={modalVisible}
      job={incomingJob}
      onAccept={handleAcceptJob}
      onDecline={handleDeclineJob}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // 1. Identity Card
  identityCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.card,
  },
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(216, 90, 48, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.brand.primary,
  },
  avatarText: {
    color: theme.colors.brand.primary,
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 16,
    fontWeight: 'bold',
  },
  identityDetails: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverPhone: {
    color: theme.colors.text.muted,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  statusPillOffline: {
    backgroundColor: 'rgba(107, 114, 128, 0.12)',
    borderColor: 'rgba(107, 114, 128, 0.2)',
  },
  statusPillOnline: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOffline: {
    backgroundColor: '#6B7280',
  },
  statusDotOnline: {
    backgroundColor: '#38BDF8',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.typography.bodySemibold.fontFamily,
  },
  statusPillTextOffline: {
    color: '#9CA3AF',
  },
  statusPillTextOnline: {
    color: '#38BDF8',
  },
  identityFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  todayPreview: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  
  // 2. Toggle button styles
  toggleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  pulseWrapper: {
    width: '100%',
    height: 54,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    zIndex: 1,
  },
  onlineButton: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    zIndex: 2,
    ...theme.shadows.glow,
    shadowColor: '#38BDF8',
  },
  toggleGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toggleButtonText: {
    color: 'white',
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 15,
    fontWeight: 'bold',
  },
  offlineButton: {
    width: '100%',
    height: 54,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1.5,
    borderColor: theme.colors.border.subtle,
  },
  offlineButtonText: {
    color: theme.colors.text.muted,
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 15,
  },
  
  // 3. Quick Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.xs,
  },
  statValue: {
    fontFamily: theme.typography.mono.fontFamily,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  
  // 4. Menu Grid
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  menuCard: {
    width: '47.5%',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: 4,
    minHeight: 120,
    justifyContent: 'space-between',
    ...theme.shadows.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(216, 90, 48, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: theme.colors.text.muted,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 12,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand.danger,
  },
  kycStatusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  kycStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  // Active Job Highlight Card
  activeJobCard: {
    width: '100%',
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
    ...theme.shadows.glow,
  },
  activeJobText: {
    color: 'white',
    fontSize: 16,
  },
  activeJobSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  activeJobBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    backgroundColor: 'white',
  },
  activeJobBadgeText: {
    color: theme.colors.brand.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
