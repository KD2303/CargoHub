import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { Navigation } from './src/navigation/Navigation';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function MainApp() {
  const { themeMode } = useTheme();

  return (
    <SafeAreaProvider key={themeMode}>
      <AuthProvider>
        <Navigation />
        <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
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
