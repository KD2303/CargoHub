import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { DriverProvider } from './src/context/DriverContext';
import { SocketProvider } from './src/context/SocketContext';
import { Navigation } from './src/navigation/Navigation';
import { initNotifications } from './src/services/NotificationService';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function MainApp() {
  const { themeMode } = useTheme();

  useEffect(() => {
    // Fire-and-forget — don't block rendering
    initNotifications().catch((e) => console.warn('initNotifications failed:', e));
  }, []);

  return (
    <SafeAreaProvider key={themeMode}>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
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

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
