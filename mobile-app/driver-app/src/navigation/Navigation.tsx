// @ts-nocheck
import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, IndianRupee, User, Search, History } from 'lucide-react-native';
import { theme } from '../theme/theme';

import { useAuth } from '../context/AuthContext';
import { useDriver } from '../context/DriverContext';

import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RoleSelectScreen } from '../screens/RoleSelectScreen';
import { KycUploadScreen } from '../screens/KycUploadScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { EarningsScreen } from '../screens/EarningsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { JobScreen } from '../screens/JobScreen';
import { AvailableJobsScreen } from '../screens/AvailableJobsScreen';
import { NotificationCenterScreen } from '../screens/NotificationCenterScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';

import { CustomerHomeScreen } from '../screens/CustomerHomeScreen';
import { CustomerHistoryScreen } from '../screens/CustomerHistoryScreen';
import { CustomerProfileScreen } from '../screens/CustomerProfileScreen';
import { CustomerActiveTripScreen } from '../screens/CustomerActiveTripScreen';
import { CustomerPaymentScreen } from '../screens/CustomerPaymentScreen';
import { RateDriverScreen } from '../screens/RateDriverScreen';
import { CustomerAddressesScreen } from '../screens/CustomerAddressesScreen';
import { CustomerSupportScreen } from '../screens/CustomerSupportScreen';

import { CustomerDashboardScreen } from '../screens/CustomerDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarStyle: { backgroundColor: theme.colors.background.card, borderTopWidth: 1, borderTopColor: theme.colors.border.subtle, height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 12 },
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} />
      <Tab.Screen name="FindJobTab" component={AvailableJobsScreen} options={{ title: 'Find Jobs', tabBarIcon: ({ color }) => <Search color={color} size={24} /> }} />
      <Tab.Screen name="EarningsTab" component={EarningsScreen} options={{ title: 'Earnings', tabBarIcon: ({ color }) => <IndianRupee color={color} size={24} /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
    </Tab.Navigator>
  );
};

const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarStyle: { backgroundColor: theme.colors.background.card, borderTopWidth: 1, borderTopColor: theme.colors.border.subtle, height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 12 },
      }}
    >
      <Tab.Screen name="CustomerDashboardTab" component={CustomerDashboardScreen} options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} />
      <Tab.Screen name="CustomerHistoryTab" component={CustomerHistoryScreen} options={{ title: 'History', tabBarIcon: ({ color }) => <History color={color} size={24} /> }} />
      <Tab.Screen name="CustomerProfileTab" component={CustomerProfileScreen} options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  const { user, isLoading } = useAuth();
  const { driver, activeBooking } = useDriver();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary }}>
        <Text style={{ color: 'white' }}>Loading Navigation...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          </>
        ) : (
          <>
            {user.role === 'USER' ? (
              <>
                <Stack.Screen name="CustomerMain" component={CustomerTabNavigator} />
                <Stack.Screen name="BookCargo" component={CustomerHomeScreen} />
                <Stack.Screen name="TrackLive" component={CustomerActiveTripScreen} />
                <Stack.Screen name="CustomerPayment" component={CustomerPaymentScreen} />
                <Stack.Screen name="RateDriver" component={RateDriverScreen} />
                <Stack.Screen name="CustomerAddresses" component={CustomerAddressesScreen} />
                <Stack.Screen name="CustomerSupport" component={CustomerSupportScreen} />
                <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
                <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="KycUpload" component={KycUploadScreen} />
                <Stack.Screen name="Job" component={JobScreen} />
                <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
                <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
