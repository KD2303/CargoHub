import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { MapPin, Navigation, Clock } from 'lucide-react-native';

export const HistoryScreen = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/bookings/my-bookings');
        setBookings(response.data.data);
      } catch (e) {
        console.error('Error fetching history', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.locationContainer}>
        <View style={styles.dotLine}>
          <View style={styles.dot} />
          <View style={styles.line} />
          <View style={[styles.dot, styles.dotEnd]} />
        </View>
        <View style={styles.addresses}>
          <Text style={styles.addressText} numberOfLines={1}>{item.pickupAddress || 'Pickup Location'}</Text>
          <View style={styles.addressSpacer} />
          <Text style={styles.addressText} numberOfLines={1}>{item.dropoffAddress || 'Dropoff Location'}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.vehicle}>{item.vehicleType}</Text>
        <Text style={styles.fare}>₹{item.finalFare || item.fareEstimate}</Text>
      </View>
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Rides</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading history...</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You haven't taken any rides yet.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: theme.colors.brand.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dotLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.brand.primary,
  },
  dotEnd: {
    backgroundColor: theme.colors.brand.secondary,
  },
  line: {
    width: 2,
    height: 24,
    backgroundColor: theme.colors.border.subtle,
    marginVertical: 4,
  },
  addresses: {
    flex: 1,
    justifyContent: 'space-between',
  },
  addressText: {
    color: theme.colors.text.primary,
    fontSize: 15,
  },
  addressSpacer: {
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    paddingTop: 12,
  },
  vehicle: {
    color: theme.colors.text.muted,
    fontSize: 14,
  },
  fare: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: 40,
  },
});
