import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Navigation, Package, IndianRupee } from 'lucide-react-native';
import { theme } from '../theme/theme';

interface AvailableJobCardProps {
  job: any;
  onPress: (job: any) => void;
}

export const AvailableJobCard: React.FC<AvailableJobCardProps> = ({ job, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => onPress(job)}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NEW JOB</Text>
        </View>
        <View style={styles.fareContainer}>
          <IndianRupee size={16} color={theme.colors.brand.success} />
          <Text style={styles.fareText}>{job.fareEstimate}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeItem}>
          <MapPin size={16} color={theme.colors.brand.primary} />
          <Text style={styles.addressText} numberOfLines={1}>{job.pickupAddress}</Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeItem}>
          <Navigation size={16} color={theme.colors.brand.secondary} />
          <Text style={styles.addressText} numberOfLines={1}>{job.dropAddress}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.detail}>
          <Package size={14} color={theme.colors.text.muted} />
          <Text style={styles.detailText}>{job.loadType}</Text>
        </View>
        <Text style={styles.actionText}>Tap to View Map ➔</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  badgeText: {
    color: theme.colors.brand.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  fareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fareText: {
    color: theme.colors.brand.success,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.typography.mono.fontFamily,
    marginLeft: 2,
  },
  routeContainer: {
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: theme.colors.border.subtle,
    marginLeft: 7,
    marginVertical: 2,
  },
  addressText: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 13,
    fontFamily: theme.typography.bodyMedium.fontFamily,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontFamily: theme.typography.bodyMedium.fontFamily,
  },
  actionText: {
    color: theme.colors.brand.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
