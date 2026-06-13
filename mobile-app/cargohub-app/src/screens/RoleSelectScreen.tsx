import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { User, Truck } from 'lucide-react-native';

export const RoleSelectScreen = () => {
  const { updateProfile } = useAuth();
  const handleSelectRole = (role: 'USER' | 'DRIVER') => updateProfile({ role });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CargoHub</Text>
      <Text style={styles.subtitle}>How would you like to use the app?</Text>
      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} onPress={() => handleSelectRole('DRIVER')} activeOpacity={0.8}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.brand.primary }]}><Truck size={32} color="white" /></View>
          <Text style={styles.cardTitle}>I'm a Driver</Text>
          <Text style={styles.cardDesc}>Accept bookings, earn money, and track your trips.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => handleSelectRole('USER')} activeOpacity={0.8}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.brand.secondary }]}><User size={32} color="white" /></View>
          <Text style={styles.cardTitle}>I'm a Customer</Text>
          <Text style={styles.cardDesc}>Book trucks, track deliveries, and manage cargo.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary, padding: theme.spacing.xl, justifyContent: 'center' },
  title: { fontFamily: theme.typography.display.fontFamily, fontSize: 28, color: theme.colors.text.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 16, color: theme.colors.text.secondary, textAlign: 'center', marginBottom: 40 },
  cardsContainer: { gap: 20 },
  card: { backgroundColor: theme.colors.background.card, borderRadius: theme.radius.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, ...theme.shadows.card, alignItems: 'center' },
  iconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontFamily: theme.typography.display.fontFamily, fontSize: 20, color: theme.colors.text.primary, marginBottom: 8 },
  cardDesc: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 14, color: theme.colors.text.muted, textAlign: 'center' },
});
