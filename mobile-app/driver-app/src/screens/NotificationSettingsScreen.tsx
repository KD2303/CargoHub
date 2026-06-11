import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export const NotificationSettingsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const isDriver = user?.role === 'DRIVER';
  const accentColor = isDriver ? theme.colors.brand.primary : theme.colors.brand.secondary;

  const [settings, setSettings] = useState({
    master: true,
    jobRequests: true,
    jobUpdates: true,
    payments: true,
    promotions: false,
    sound: true,
    vibration: true,
  });

  const toggleSwitch = (key: keyof typeof settings) => {
    if (key === 'master') {
      const newValue = !settings.master;
      setSettings({
        master: newValue,
        jobRequests: newValue,
        jobUpdates: newValue,
        payments: newValue,
        promotions: newValue,
        sound: newValue,
        vibration: newValue,
      });
    } else {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key],
        // Auto enable master if a child is enabled
        master: !prev[key] ? true : prev.master,
      }));
    }
  };

  const renderSwitchRow = (title: string, subtitle: string, key: keyof typeof settings, isMaster = false) => (
    <View style={[styles.settingRow, isMaster && styles.masterRow]}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isMaster && styles.masterTitle]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        trackColor={{ false: theme.colors.border.subtle, true: accentColor }}
        thumbColor={'#ffffff'}
        ios_backgroundColor={theme.colors.border.subtle}
        onValueChange={() => toggleSwitch(key)}
        value={settings[key]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Notification Settings" showBack={true} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Master Toggle */}
        <View style={styles.section}>
          {renderSwitchRow('All Notifications', 'Enable or disable all app notifications', 'master', true)}
        </View>

        {/* Categories */}
        <Text style={styles.sectionHeader}>Categories</Text>
        <View style={styles.sectionCard}>
          {isDriver && renderSwitchRow('New Job Requests', 'Alerts when a customer books a ride', 'jobRequests')}
          <View style={styles.divider} />
          {renderSwitchRow(isDriver ? 'Trip Updates' : 'Driver Updates', 'Status changes for active bookings', 'jobUpdates')}
          <View style={styles.divider} />
          {renderSwitchRow('Payments', 'Earnings, transfers, and receipts', 'payments')}
          <View style={styles.divider} />
          {renderSwitchRow('Offers & Promotions', 'Discounts and earning opportunities', 'promotions')}
        </View>

        {/* Delivery Options */}
        <Text style={styles.sectionHeader}>Delivery Options</Text>
        <View style={styles.sectionCard}>
          {renderSwitchRow('Sound', 'Play sounds for important alerts', 'sound')}
          <View style={styles.divider} />
          {renderSwitchRow('Vibration', 'Haptic feedback on alerts', 'vibration')}
        </View>

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
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 14,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  masterRow: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  masterTitle: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontWeight: 'bold',
  },
  subtitle: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.muted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.subtle,
    marginLeft: 16,
  },
});
