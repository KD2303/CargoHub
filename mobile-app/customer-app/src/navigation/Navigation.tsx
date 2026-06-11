import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, History, User } from 'lucide-react-native';
import { theme } from '../theme/theme';

import { useAuth } from '../context/AuthContext';

import { LandingScreen } from '../screens/LandingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ActiveTripScreen } from '../screens/ActiveTripScreen';

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
      <Tab.Screen name="HistoryTab" component={HistoryScreen} options={{ title: 'My Rides', tabBarIcon: ({ color }) => <History color={color} size={24} /> }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile', tabBarIcon: ({ color }) => <User color={color} size={24} /> }} />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
