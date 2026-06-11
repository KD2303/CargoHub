import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../theme/theme';
import { Star } from 'lucide-react-native';
import { GradientButton } from '../components/GradientButton';
import { StatusBar } from 'expo-status-bar';

export const RateDriverScreen = ({ navigation }: any) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('CustomerMain');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <Text style={styles.driverName}>Rajesh Kumar</Text>
        <Text style={styles.heading}>How was your delivery?</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={star} 
              onPress={() => setRating(star)}
              activeOpacity={0.7}
            >
              <Star 
                size={40} 
                color={star <= rating ? theme.colors.brand.warning : theme.colors.border.subtle} 
                fill={star <= rating ? theme.colors.brand.warning : 'transparent'} 
                style={styles.star} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.commentBox}
          placeholder="Tell us more (optional)"
          placeholderTextColor={theme.colors.text.muted}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <GradientButton 
          title="Submit Rating" 
          onPress={handleSubmit} 
          loading={loading} 
          variant="primary"
          style={styles.submitBtn}
          disabled={rating === 0}
        />
        
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('CustomerMain')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(55, 138, 221, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
  },
  avatarText: {
    color: theme.colors.brand.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  driverName: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heading: {
    color: theme.colors.text.muted,
    fontSize: 16,
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  star: {
    marginHorizontal: 4,
  },
  commentBox: {
    width: '100%',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.md,
    padding: 16,
    color: theme.colors.text.primary,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  submitBtn: {
    width: '100%',
    marginBottom: 16,
  },
  skipBtn: {
    padding: 12,
  },
  skipText: {
    color: theme.colors.text.muted,
    fontSize: 16,
    fontWeight: '600',
  },
});
