import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'coral' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export const GradientButton: React.FC<GradientButtonProps> = ({ title, onPress, variant = 'primary', style, textStyle, icon, loading = false, disabled = false }) => {
  if (variant === 'secondary') {
    return (
      <TouchableOpacity style={[styles.secondaryButton, style, disabled && styles.disabled]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color={theme.colors.brand.primary} /> : <>{icon}<Text style={[styles.secondaryText, textStyle]}>{title}</Text></>}
      </TouchableOpacity>
    );
  }

  const gradientColors = variant === 'coral' ? [theme.colors.gradient.coralStart, theme.colors.gradient.coralEnd] : [theme.colors.gradient.start, theme.colors.brand.primaryDark];

  return (
    <TouchableOpacity style={[styles.container, style, disabled && styles.disabled]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      <LinearGradient colors={gradientColors as [string, string]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {loading ? <ActivityIndicator color="white" /> : <>{icon}<Text style={[styles.text, textStyle]}>{title}</Text></>}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: theme.radius.full, overflow: 'hidden', shadowColor: theme.colors.brand.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8 },
  gradient: { paddingVertical: 14, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  text: { color: 'white', fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 15, letterSpacing: 0.5 },
  secondaryButton: { paddingVertical: 14, paddingHorizontal: 32, borderRadius: theme.radius.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(22, 24, 36, 0.6)', borderWidth: 1.5, borderColor: theme.colors.border.subtle },
  secondaryText: { color: theme.colors.text.primary, fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 15 },
  disabled: { opacity: 0.6 }
});
