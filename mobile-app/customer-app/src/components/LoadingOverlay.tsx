import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { theme } from '../theme/theme';

interface LoadingOverlayProps { visible: boolean; message?: string; }

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message = 'Loading...' }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,253,251,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  box: { backgroundColor: theme.colors.background.card, padding: 24, borderRadius: theme.radius.xl, alignItems: 'center', ...theme.shadows.card, borderWidth: 1, borderColor: theme.colors.border.subtle },
  message: { marginTop: 12, fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 14, color: theme.colors.text.secondary },
});
