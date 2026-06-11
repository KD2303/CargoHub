// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Header } from '../components/Header';
import { theme } from '../theme/theme';
import { Bell, Truck, Wallet, FileCheck, Star, Info, ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock Notifications Data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'JOB',
    title: 'New Job Request',
    body: '₹340 · 4.2 km · Large Box',
    timeAgo: 'Just now',
    isRead: false,
    action: 'View Job',
  },
  {
    id: '2',
    type: 'SYSTEM',
    title: 'KYC Approved ✅',
    body: 'You\'re verified! Go online and start earning.',
    timeAgo: '2 hours ago',
    isRead: true,
  },
  {
    id: '3',
    type: 'RATING',
    title: 'You got a ⭐⭐⭐⭐⭐ rating!',
    body: 'Rahul rated your delivery. Keep it up!',
    timeAgo: 'Yesterday',
    isRead: true,
  },
  {
    id: '4',
    type: 'PAYMENT',
    title: 'Payment Received',
    body: '₹850 added to your weekly earnings.',
    timeAgo: '2 days ago',
    isRead: true,
    action: 'View Earnings',
  },
];

export const NotificationCenterScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filteredNotifications = activeTab === 'All' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab.toUpperCase() || (activeTab === 'System' && ['SYSTEM', 'RATING', 'KYC'].includes(n.type)));

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'JOB': return <Truck size={18} color="white" />;
      case 'PAYMENT': return <Wallet size={18} color="white" />;
      case 'KYC': return <FileCheck size={18} color="white" />;
      case 'RATING': return <Star size={18} color="white" />;
      default: return <Bell size={18} color="white" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'JOB': return theme.colors.brand.primary; // Coral
      case 'PAYMENT': return theme.colors.brand.secondary; // Blue
      case 'RATING': return '#F59E0B'; // Amber
      default: return '#64748B'; // Slate
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack={true} />
      
      {/* Mark All Read */}
      <View style={styles.topActions}>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markReadText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {['All', 'Jobs', 'Payments', 'System'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, isActive && styles.activeTabPill]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyBellWrapper}>
              <Bell size={48} color={theme.colors.text.muted} style={{ opacity: 0.5 }} />
              <Text style={styles.zzz}>Z Z Z</Text>
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>We'll let you know when something important happens</Text>
          </View>
        ) : (
          filteredNotifications.map((notif) => (
            <TouchableOpacity key={notif.id} style={[styles.card, !notif.isRead && styles.unreadCard]} activeOpacity={0.7}>
              {!notif.isRead && <View style={styles.unreadBar} />}
              
              <View style={[styles.iconCircle, { backgroundColor: getIconColor(notif.type) }]}>
                {getIconForType(notif.type)}
              </View>

              <View style={styles.content}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.title, !notif.isRead && styles.unreadTitle]}>{notif.title}</Text>
                  <Text style={styles.timeAgo}>{notif.timeAgo}</Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>{notif.body}</Text>
                
                {notif.action && (
                  <View style={[styles.actionChip, { backgroundColor: notif.type === 'JOB' ? theme.colors.brand.primary : theme.colors.brand.secondary }]}>
                    <Text style={styles.actionChipText}>{notif.action}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
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
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  markReadText: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 13,
    color: theme.colors.text.muted,
  },
  tabScrollContainer: {
    paddingVertical: theme.spacing.md,
  },
  tabsContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  activeTabPill: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  tabText: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  unreadCard: {
    backgroundColor: '#1E1A1A', // Tinted coral background simulation for dark mode
    borderColor: 'rgba(216, 90, 48, 0.3)',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: theme.colors.brand.primary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: theme.colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
    fontFamily: theme.typography.bodySemibold.fontFamily,
  },
  timeAgo: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 11,
    color: theme.colors.text.muted,
    marginLeft: 8,
  },
  body: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.muted,
    lineHeight: 18,
  },
  actionChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  actionChipText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyBellWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  zzz: {
    position: 'absolute',
    top: -10,
    right: -20,
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.muted,
    opacity: 0.6,
  },
  emptyTitle: {
    fontFamily: theme.typography.display.fontFamily,
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptySub: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 14,
    color: theme.colors.text.muted,
    textAlign: 'center',
    maxWidth: '70%',
  },
});
