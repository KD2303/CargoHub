import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { useDriver } from '../context/DriverContext';
import { Wallet, Calendar, ArrowUpRight, Award } from 'lucide-react-native';
import { api } from '../services/api';

const screenWidth = Dimensions.get('window').width;

const dailyChartData = [
  { label: '9 AM', earnings: 150 }, { label: '11 AM', earnings: 450 }, { label: '1 PM', earnings: 0 },
  { label: '3 PM', earnings: 640 }, { label: '5 PM', earnings: 340 }, { label: '7 PM', earnings: 800 },
];

const weeklyChartData = [
  { label: 'Mon', earnings: 1200 }, { label: 'Tue', earnings: 1800 }, { label: 'Wed', earnings: 850 },
  { label: 'Thu', earnings: 2400 }, { label: 'Fri', earnings: 1650 }, { label: 'Sat', earnings: 2800 },
  { label: 'Sun', earnings: 3200 },
];

const monthlyChartData = [
  { label: 'Wk 1', earnings: 12000 }, { label: 'Wk 2', earnings: 15400 }, { label: 'Wk 3', earnings: 9800 },
  { label: 'Wk 4', earnings: 18600 },
];

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
};

export const EarningsScreen = () => {
  const { driver } = useDriver();
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [trips, setTrips] = useState<any[]>([]);

  const earnings = driver?.earnings || { today: 0, thisWeek: 0, thisMonth: 0, tripCount: 0 };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/bookings/driver/history');
        if (response.data?.data) {
          setTrips(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching driver history:', err);
      }
    };
    fetchHistory();
  }, [driver]);

  const getChartData = () => {
    switch (activeTab) {
      case 'Daily': return dailyChartData;
      case 'Monthly': return monthlyChartData;
      default: return weeklyChartData;
    }
  };

  const chartData = getChartData();
  const maxEarnings = Math.max(...chartData.map(d => d.earnings), 1);

  return (
    <View style={styles.container}>
      <Header title="Earnings" />
      
      {/* Scrollable Container */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Toggle tabs (Daily · Weekly · Monthly) */}
        <View style={styles.tabContainer}>
          {(['Daily', 'Weekly', 'Monthly'] as const).map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
 
        {/* 3 Summary Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              {activeTab === 'Daily' ? 'Today' : activeTab === 'Weekly' ? 'This Week' : 'This Month'}
            </Text>
            <Text style={styles.statValue}>
              ₹{activeTab === 'Daily' ? earnings.today : activeTab === 'Weekly' ? earnings.thisWeek : earnings.thisMonth}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              {activeTab === 'Daily' ? 'This Week' : activeTab === 'Weekly' ? 'This Month' : 'This Week'}
            </Text>
            <Text style={styles.statValue}>
              ₹{activeTab === 'Daily' ? earnings.thisWeek : activeTab === 'Weekly' ? earnings.thisMonth : earnings.thisWeek}
            </Text>
          </View>
          <View style={[styles.statCard, styles.accentCard]}>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Total Trips</Text>
            <Text style={[styles.statValue, { color: 'white' }]}>{earnings.tripCount}</Text>
          </View>
        </View>
 
        {/* Premium Bar Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{activeTab} Overview</Text>
            <Calendar size={18} color={theme.colors.text.muted} />
          </View>
          
          <View style={styles.chartBody}>
            {chartData.map((item, i) => {
              const heightPercent = (item.earnings / maxEarnings) * 85; // Max height in percent
              return (
                <View key={i} style={styles.chartCol}>
                  {/* Bar value on top */}
                  <Text style={styles.barValue}>
                    {item.earnings > 0 
                      ? item.earnings >= 1000 
                        ? `${(item.earnings / 1000).toFixed(1)}k` 
                        : item.earnings 
                      : '-'}
                  </Text>
                  
                  {/* Vertical bar */}
                  <View style={styles.barContainer}>
                    <View style={[styles.barFill, { height: `${heightPercent || 2}%` }]} />
                  </View>
                  
                  {/* Label */}
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
 
        {/* Recent Trips Header */}
        <Text style={styles.sectionTitle}>Recent Trips</Text>
 
        {/* Trips List */}
        <View style={styles.tripsList}>
          {trips.map((trip, idx) => (
            <View key={idx} style={styles.tripRow}>
              <View style={styles.tripDetails}>
                <Text style={styles.tripDate}>{formatDate(trip.createdAt)}</Text>
                <Text style={styles.tripRoute}>{trip.pickupAddress} ➔ {trip.dropAddress}</Text>
                <View style={styles.cargoTag}>
                  <Text style={styles.cargoTagText}>{trip.loadType}</Text>
                </View>
              </View>
              
              <View style={styles.tripAction}>
                <Text style={styles.tripFare}>+₹{trip.finalFare || trip.fareEstimate}</Text>
                <ArrowUpRight size={16} color={theme.colors.brand.secondary} />
              </View>
            </View>
          ))}
        </View>
 
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  scrollContent: { padding: theme.spacing.lg },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.full,
    padding: 4,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: theme.radius.full,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.brand.primary, // Coral active state
  },
  tabBtnText: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 13,
    color: theme.colors.text.muted,
  },
  tabBtnTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Stats summary cards
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.xs,
  },
  accentCard: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  statLabel: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 11,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: theme.typography.mono.fontFamily,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },

  // Chart
  chartCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  chartBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 10,
  },
  chartCol: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    width: 12,
    height: 110,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginVertical: 6,
  },
  barFill: {
    width: '100%',
    backgroundColor: theme.colors.brand.primary, // Coral bars
    borderRadius: 6,
  },
  barLabel: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 10,
    color: theme.colors.text.muted,
  },
  barValue: {
    fontFamily: theme.typography.mono.fontFamily,
    fontSize: 9,
    color: theme.colors.text.muted,
    marginBottom: 2,
  },
  
  // Trips List
  sectionTitle: {
    fontFamily: theme.typography.display.fontFamily,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  tripsList: {
    gap: theme.spacing.md,
    marginBottom: 40,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.xs,
  },
  tripDetails: {
    flex: 1,
  },
  tripDate: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.muted,
  },
  tripRoute: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cargoTag: {
    backgroundColor: 'rgba(216, 90, 48, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  cargoTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.brand.primary,
  },
  tripAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripFare: {
    fontFamily: theme.typography.mono.fontFamily,
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.brand.secondary, // Light blue fare text
  },
});
