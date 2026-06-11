import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';

interface EarningsCardProps { label: string; amount: number; trips?: number; style?: ViewStyle; isTotal?: boolean; }

export const EarningsCard: React.FC<EarningsCardProps> = ({ label, amount, trips, style, isTotal = false }) => {
  return (
    <View style={[styles.card, isTotal && styles.totalCard, style]}>
      <Text style={[styles.label, isTotal && styles.totalLabel]}>{label}</Text>
      <Text style={[styles.amount, isTotal && styles.totalAmount]}>₹{amount.toLocaleString('en-IN')}</Text>
      {trips !== undefined && (
        <View style={styles.tripsContainer}>
          <Text style={[styles.trips, isTotal && styles.totalTrips]}>{trips} {trips === 1 ? 'trip' : 'trips'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, ...theme.shadows.card },
  totalCard: { backgroundColor: theme.colors.brand.primary, borderColor: theme.colors.brand.primary },
  label: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 12, color: theme.colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  totalLabel: { color: 'rgba(255, 255, 255, 0.8)' },
  amount: { fontFamily: theme.typography.mono.fontFamily, fontSize: 32, fontWeight: 'bold', color: theme.colors.text.primary },
  totalAmount: { color: 'white' },
  tripsContainer: { marginTop: 8, backgroundColor: theme.colors.background.tertiary, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.radius.sm },
  trips: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 12, color: theme.colors.brand.secondary },
  totalTrips: { color: 'white' },
});
