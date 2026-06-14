import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { DriverProvider } from './src/context/DriverContext';
import { SocketProvider } from './src/context/SocketContext';
import { Navigation } from './src/navigation/Navigation';
import { initNotifications } from './src/services/NotificationService';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Keep the splash screen visible while we finish loading
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if called too late or not supported
});

// Error boundary to prevent the app from silently dying behind the splash screen
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={ebStyles.container}>
          <Text style={ebStyles.emoji}>⚠️</Text>
          <Text style={ebStyles.title}>Something went wrong</Text>
          <Text style={ebStyles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text style={ebStyles.hint}>Please restart the app</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const ebStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 24 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  message: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  hint: { color: '#888', fontSize: 13 },
});

function MainApp() {
  const { themeMode } = useTheme();

  useEffect(() => {
    // Hide splash screen once the app has rendered
    SplashScreen.hideAsync().catch((e) => console.warn('hideAsync failed:', e));

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
    <ErrorBoundary>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

