import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { Check } from 'lucide-react-native';

interface StepIndicatorProps { currentStep: number; }
const steps = ['Heading', 'Arrived', 'In Transit', 'Delivered'];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <React.Fragment key={step}>
            <View style={styles.stepContainer}>
              <View style={[
                styles.circle,
                isActive && styles.activeCircle,
                isCompleted && styles.completedCircle
              ]}>
                {isCompleted ? (
                  <Check color="white" size={14} />
                ) : (
                  <Text style={[
                    styles.circleText,
                    isActive && styles.activeCircleText
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={[
                styles.label,
                (isActive || isCompleted) && styles.activeLabel,
                isActive && { color: theme.colors.brand.primary }
              ]}>{step}</Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.line,
                isCompleted && styles.activeLine
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.md },
  stepContainer: { alignItems: 'center', width: 68 },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.background.tertiary, borderWidth: 2, borderColor: theme.colors.border.subtle, alignItems: 'center', justifyContent: 'center', marginBottom: 6, zIndex: 2 },
  activeCircle: { borderColor: theme.colors.brand.primary, backgroundColor: theme.colors.background.card },
  completedCircle: { backgroundColor: theme.colors.brand.secondary, borderColor: theme.colors.brand.secondary },
  circleText: { fontFamily: theme.typography.mono.fontFamily, fontSize: 12, color: theme.colors.text.muted },
  activeCircleText: { color: theme.colors.brand.primary, fontWeight: 'bold' },
  label: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 10, color: theme.colors.text.muted, textAlign: 'center' },
  activeLabel: { color: theme.colors.text.primary, fontFamily: theme.typography.bodySemibold.fontFamily },
  line: { flex: 1, height: 2, backgroundColor: theme.colors.border.subtle, marginTop: -14, zIndex: 1 },
  activeLine: { backgroundColor: theme.colors.brand.secondary },
});
