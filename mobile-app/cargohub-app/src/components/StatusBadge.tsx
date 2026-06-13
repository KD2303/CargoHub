import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export type BadgeStatus = 'pending' | 'accepted' | 'arriving' | 'transit' | 'delivered' | 'cancelled' | 'verified' | 'rejected';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
}

const getBadgeConfig = (status: BadgeStatus) => {
  switch (status) {
    case 'pending': return { bg: 'rgba(245, 166, 35, 0.12)', text: '#F5A623', border: 'rgba(245,166,35,0.25)' };
    case 'accepted': return { bg: 'rgba(56, 189, 248, 0.12)', text: '#38BDF8', border: 'rgba(56,189,248,0.25)' };
    case 'arriving': return { bg: 'rgba(167, 139, 250, 0.12)', text: '#A78BFA', border: 'rgba(167,139,250,0.25)' };
    case 'transit': return { bg: 'rgba(56, 189, 248, 0.12)', text: '#38BDF8', border: 'rgba(56,189,248,0.25)' };
    case 'delivered': case 'verified': return { bg: 'rgba(52, 211, 153, 0.12)', text: '#34D399', border: 'rgba(52,211,153,0.25)' };
    case 'cancelled': case 'rejected': return { bg: 'rgba(248, 113, 113, 0.12)', text: '#F87171', border: 'rgba(248,113,113,0.25)' };
    default: return { bg: 'rgba(156, 163, 175, 0.12)', text: '#9CA3AF', border: 'rgba(156,163,175,0.25)' };
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const config = getBadgeConfig(status);
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Text style={[styles.text, { color: config.text }]}>{label || status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: theme.radius.full, borderWidth: 1, alignSelf: 'flex-start' },
  text: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
});
