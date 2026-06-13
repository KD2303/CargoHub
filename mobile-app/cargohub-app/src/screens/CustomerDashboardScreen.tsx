import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useDriver } from '../context/DriverContext';
import { Truck, MapPin, Clock, CreditCard, User, HeadphonesIcon, Wallet, TrendingUp, PackageOpen, IndianRupee } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { NotificationBell } from '../components/NotificationBell';
import { api } from '../services/api';

const { width } = Dimensions.get('window');

export const CustomerDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { activeBooking } = useDriver();
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeShipments, setActiveShipments] = useState(0);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await api.get('/bookings?limit=3');
        if (response.data?.data) {
          setRecentBookings(response.data.data);
        }
        
        const allRes = await api.get('/bookings');
        if (allRes.data?.data) {
          const bookings = allRes.data.data;
          setTotalBookings(bookings.length);
          
          const spent = bookings
            .filter((b: any) => b.status === 'DELIVERED')
            .reduce((sum: number, b: any) => sum + (b.finalFare || b.fareEstimate || 0), 0);
          setTotalSpent(spent);
          
          const active = bookings.filter((b: any) => ['PENDING', 'ACCEPTED', 'DRIVER_ARRIVING', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status)).length;
          setActiveShipments(active);
        }
      } catch (e) {
        console.log('Error fetching dashboard data', e);
      }
    };
    fetchRecent();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top - Customer Identity Card */}
        <View style={styles.identityCard}>
          <View style={styles.headerRow}>
            <View style={styles.avatarGroup}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
              </View>
              <View style={styles.greetingTextContainer}>
                <Text style={styles.greeting}>Good morning, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
                <Text style={styles.phone}>{user?.phone || '+91 98765 43210'}</Text>
              </View>
            </View>
            <NotificationBell unreadCount={1} />
          </View>
          <TouchableOpacity 
            style={styles.quickActionPill} 
            onPress={() => navigation.navigate('BookCargo')}
          >
            <Text style={styles.quickActionText}>Book a Truck →</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        {/* Stats Grid - Matching Web Parity */}
        <View style={styles.statsGrid}>
          <View style={styles.statCardHalf}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(55, 138, 221, 0.1)' }]}>
              <PackageOpen size={18} color={theme.colors.brand.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Total Bookings</Text>
              <Text style={styles.statValue}>{totalBookings}</Text>
            </View>
          </View>
          <View style={styles.statCardHalf}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 102, 72, 0.1)' }]}>
              <Truck size={18} color={theme.colors.brand.secondary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Active Shipments</Text>
              <Text style={styles.statValue}>{activeShipments}</Text>
            </View>
          </View>
          <View style={styles.statCardHalf}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <IndianRupee size={18} color="#10B981" />
            </View>
            <View>
              <Text style={styles.statLabel}>Total Spent</Text>
              <Text style={styles.statValue}>₹{totalSpent}</Text>
            </View>
          </View>
          <View style={styles.statCardHalf}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <MapPin size={18} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.statLabel}>Saved Addresses</Text>
              <Text style={styles.statValue}>2</Text>
            </View>
          </View>
        </View>

        {/* Active Booking Banner (Conditional) */}
        {activeBooking && (
          <TouchableOpacity 
            style={styles.activeBanner}
            onPress={() => navigation.navigate('TrackLive')}
          >
            <Text style={styles.activeBannerText}>📦 Your delivery is on the way · Tap to track</Text>
            <View style={styles.pulseDot} />
          </TouchableOpacity>
        )}

        {/* Dashboard Menu Grid */}
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={[styles.gridCard, styles.primaryGridCard]} 
            onPress={() => navigation.navigate('BookCargo')}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'white' }]}>
              <Truck size={24} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.gridCardText}>Book Cargo</Text>
          </TouchableOpacity>

          {activeBooking && (
            <TouchableOpacity 
              style={styles.gridCard} 
              onPress={() => navigation.navigate('TrackLive')}
            >
              <View style={styles.iconCircle}>
                <MapPin size={24} color={theme.colors.brand.primary} />
                <View style={styles.liveIndicator} />
              </View>
              <Text style={styles.gridCardText}>Track Live</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => navigation.navigate('CustomerHistoryTab')}
          >
            <View style={styles.iconCircle}>
              <Clock size={24} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.gridCardText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => navigation.navigate('CustomerPayments')}
          >
            <View style={styles.iconCircle}>
              <CreditCard size={24} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.gridCardText}>Payments</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => navigation.navigate('CustomerProfileTab')}
          >
            <View style={styles.iconCircle}>
              <User size={24} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.gridCardText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => navigation.navigate('CustomerSupport')}
          >
            <View style={styles.iconCircle}>
              <HeadphonesIcon size={24} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.gridCardText}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Bookings Strip */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CustomerHistoryTab')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {recentBookings.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentStrip}>
            {recentBookings.map((b) => (
              <TouchableOpacity 
                key={b.id} 
                style={styles.recentCard}
                onPress={() => navigation.navigate('CustomerHistoryTab')}
              >
                <Text style={styles.recentDate}>{new Date(b.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
                <Text style={styles.recentRoute} numberOfLines={1}>
                  {b.pickupAddress?.split(',')[0]} → {b.dropAddress?.split(',')[0]}
                </Text>
                <View style={styles.recentFooter}>
                  <View style={[
                    styles.statusChip, 
                    { backgroundColor: b.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.1)' : b.status === 'CANCELLED' ? 'rgba(229, 57, 53, 0.1)' : 'rgba(55, 138, 221, 0.1)' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: b.status === 'DELIVERED' ? '#10B981' : b.status === 'CANCELLED' ? theme.colors.brand.danger : theme.colors.brand.primary }
                    ]}>{b.status}</Text>
                  </View>
                  <Text style={styles.recentFare}>₹{b.finalFare || b.fareEstimate}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={{ padding: 20, alignItems: 'center', opacity: 0.5 }}>
            <Text style={{ color: theme.colors.text.muted }}>No recent bookings</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  identityCard: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingTextContainer: {
    flex: 1,
  },
  greeting: {
    color: theme.colors.text.primary,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    color: theme.colors.text.muted,
    fontSize: 14,
  },
  quickActionPill: {
    backgroundColor: theme.colors.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  quickActionText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, marginBottom: 20, justifyContent: 'space-between' },
  statCardHalf: { width: (width - 52) / 2, backgroundColor: theme.colors.background.card, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: theme.colors.border.subtle, ...theme.shadows.sm },
  statIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statLabel: { color: theme.colors.text.muted, fontSize: 10, fontWeight: '600', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { color: theme.colors.text.primary, fontSize: 16, fontWeight: 'bold', fontFamily: 'monospace' },

  activeBanner: { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: theme.radius.md, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#10B981' },
  activeBannerText: {
    color: theme.colors.brand.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand.secondary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  gridCard: {
    width: (width - 56) / 2, // 2 columns with padding
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  primaryGridCard: {
    backgroundColor: 'rgba(55, 138, 221, 0.15)', // Blue tinted
    borderColor: 'rgba(55, 138, 221, 0.3)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(55, 138, 221, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.brand.danger,
    borderWidth: 2,
    borderColor: theme.colors.background.card,
  },
  gridCardText: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: theme.colors.brand.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  recentStrip: {
    overflow: 'visible',
  },
  recentCard: {
    width: width * 0.7,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  recentDate: {
    color: theme.colors.text.muted,
    fontSize: 12,
    marginBottom: 8,
  },
  recentRoute: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  statusText: {
    color: theme.colors.brand.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  recentFare: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
