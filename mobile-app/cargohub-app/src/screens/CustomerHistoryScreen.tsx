import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { api } from '../services/api';
import { StatusBar } from 'expo-status-bar';

const TABS = ['All', 'Active', 'Completed', 'Cancelled'];

export const CustomerHistoryScreen = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/bookings');
        setBookings(response.data?.data || []);
      } catch (e) {
        console.error('Error fetching history', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return b.status !== 'DELIVERED' && b.status !== 'CANCELLED';
    if (activeTab === 'Completed') return b.status === 'DELIVERED';
    if (activeTab === 'Cancelled') return b.status === 'CANCELLED';
    return true;
  });

  const getStatusColor = (status: string) => {
    if (status === 'DELIVERED') return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10B981' };
    if (status === 'CANCELLED') return { bg: 'rgba(229, 57, 53, 0.1)', text: theme.colors.brand.danger };
    return { bg: 'rgba(55, 138, 221, 0.1)', text: theme.colors.brand.primary };
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardTop}>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
        </View>

        <Text style={styles.routeText} numberOfLines={1}>
          {item.pickupAddress?.split(',')[0] || 'Pickup'} → {item.dropAddress?.split(',')[0] || 'Dropoff'}
        </Text>

        <View style={styles.cardBottom}>
          <View style={styles.chipsRow}>
            <View style={styles.cargoChip}>
              <Text style={styles.cargoText}>{item.vehicleType || 'Small Box'}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.fare}>₹{item.finalFare || item.fareEstimate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Booking History</Text>
      
      {/* Toggle Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading history...</Text>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No bookings found in this category.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, paddingHorizontal: 20, marginBottom: 20 },
  
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.full, backgroundColor: theme.colors.background.tertiary, borderWidth: 1, borderColor: theme.colors.border.subtle },
  tabActive: { backgroundColor: theme.colors.brand.primary, borderColor: theme.colors.brand.primary },
  tabText: { color: theme.colors.text.muted, fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: 'white' },

  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.md, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border.subtle },
  cardTop: { marginBottom: 8 },
  date: { color: theme.colors.text.muted, fontSize: 13 },
  routeText: { color: theme.colors.text.primary, fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chipsRow: { flexDirection: 'row', gap: 8 },
  cargoChip: { backgroundColor: theme.colors.background.tertiary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.border.subtle },
  cargoText: { color: theme.colors.text.secondary, fontSize: 11, fontWeight: '600' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.sm },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  
  fare: { color: theme.colors.text.primary, fontSize: 18, fontWeight: 'bold' },
  
  loadingText: { color: theme.colors.text.muted, textAlign: 'center', marginTop: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: theme.colors.text.muted, fontSize: 16 },
});
