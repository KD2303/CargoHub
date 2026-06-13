import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Easing } from 'react-native';
import { theme } from '../theme/theme';
import { Truck, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface NotificationBannerProps {
  visible: boolean;
  job: any;
  onDismiss: () => void;
  onPress: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ visible, job, onDismiss, onPress }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (visible && job) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -150,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, job]);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  if (!job && !visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }],
          top: insets.top + 10,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.banner} 
        activeOpacity={0.9} 
        onPress={() => {
          handleDismiss();
          onPress();
        }}
      >
        <View style={styles.iconContainer}>
          <Truck size={20} color="white" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>New Job Request ⚡</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            ₹{job?.fareEstimate} · {job?.distance || '4.2'} km · {job?.loadType}
          </Text>
          <Text style={styles.actionText}>Tap to view details</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={18} color={theme.colors.text.muted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  banner: {
    width: width - 32,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.brand.primary,
    ...theme.shadows.glow,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  actionText: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 12,
    color: theme.colors.brand.primary,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
});
