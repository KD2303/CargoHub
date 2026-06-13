// Trigger re-compile for Reanimated plugin
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CountdownTimerProps { duration: number; onComplete: () => void; size?: number; strokeWidth?: number; }

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ duration, onComplete, size = 60, strokeWidth = 4 }) => {
  const [timeLeft, setTimeLeft] = React.useState(duration);
  const progress = useSharedValue(1);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    progress.value = withTiming(0, { duration: duration * 1000, easing: Easing.linear });
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); onComplete(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - progress.value) }));
  const isWarning = timeLeft <= 10;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle stroke={theme.colors.border.subtle} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <AnimatedCircle stroke={isWarning ? theme.colors.brand.danger : theme.colors.brand.primary} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} strokeDasharray={`${circumference} ${circumference}`} animatedProps={animatedProps} strokeLinecap="round" />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.text, isWarning && styles.textWarning]}>{timeLeft}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  svg: { transform: [{ rotate: '-90deg' }] },
  textContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
  text: { fontFamily: theme.typography.mono.fontFamily, fontSize: 20, color: theme.colors.text.primary, fontWeight: 'bold' },
  textWarning: { color: theme.colors.brand.danger },
});
