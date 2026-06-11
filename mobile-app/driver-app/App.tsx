import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { DriverProvider } from './src/context/DriverContext';
import { SocketProvider } from './src/context/SocketContext';
import { Navigation } from './src/navigation/Navigation';
import { initNotifications } from './src/services/NotificationService';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      console.log('[DEBUG] App prepare started');
      try {
        await initNotifications();
      } catch (e) {
        console.warn(e);
      } finally {
        console.log('[DEBUG] Setting fontsLoaded = true');
        setFontsLoaded(true);
        try {
          console.log('[DEBUG] Hiding Splash Screen...');
          await SplashScreen.hideAsync();
          console.log('[DEBUG] Splash Screen hidden');
        } catch (splashErr) {
          console.warn('SplashScreen hide failed:', splashErr);
        }
      }
    }
    prepare();
  }, []);

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white' }}>Loading App...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <SocketProvider>
          <DriverProvider>
            <Navigation />
          </DriverProvider>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
// Trigger TS server reload


