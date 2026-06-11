import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps { title: string; showBack?: boolean; rightElement?: React.ReactNode; }

export const Header: React.FC<HeaderProps> = ({ title, showBack = false, rightElement }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ChevronLeft color={theme.colors.text.primary} size={24} />
          </TouchableOpacity>
        ) : <View style={styles.placeholder} />}
        <Text style={styles.title}>{title}</Text>
        {rightElement ? <View style={styles.rightContainer}>{rightElement}</View> : <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background.primary, borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle },
  content: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md },
  title: { fontFamily: theme.typography.display.fontFamily, fontSize: 18, color: theme.colors.text.primary },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  placeholder: { width: 40 },
  rightContainer: { minWidth: 40, alignItems: 'flex-end' },
});
