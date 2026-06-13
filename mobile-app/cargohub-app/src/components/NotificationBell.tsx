import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

interface NotificationBellProps {
  unreadCount?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ unreadCount = 3 }) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // Use coral for driver, blue for customer
  const badgeColor = user?.role === 'DRIVER' ? theme.colors.brand.primary : theme.colors.brand.secondary;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => navigation.navigate('NotificationCenter')}
      activeOpacity={0.7}
    >
      <Bell color={theme.colors.text.primary} size={24} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.background.primary,
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
