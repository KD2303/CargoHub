import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Easing, Image } from 'react-native';
import { theme } from '../theme/theme';
import { GradientButton } from '../components/GradientButton';
import { Truck as TruckIcon, ChevronDown as ChevronDownIcon } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const Truck = TruckIcon as any;
const ChevronDown = ChevronDownIcon as any;

const { width } = Dimensions.get('window');

interface LandingScreenProps {
  navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const truckAnim = useRef(new Animated.Value(-150)).current;
  const roadAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Truck Animation (Loops across the screen)
    Animated.loop(
      Animated.timing(truckAnim, {
        toValue: width + 50,
        duration: 4500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      })
    ).start();

    // 2. Road line animation (Loops right to left to simulate motion)
    Animated.loop(
      Animated.timing(roadAnim, {
        toValue: -40,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 3. Arrow bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 6,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 4. Logo & text fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStart = (role: 'DRIVER' | 'USER') => {
    navigation.navigate('Login', { role });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Header Section */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Image source={require('../assets/logo.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
          </View>
          <Text style={styles.logoText}>CargoHub</Text>
        </View>
        
        <View style={styles.headlineContainer}>
          <Text style={styles.headline}>Move Anything.{"\n"}Anywhere.</Text>
          <Text style={styles.subheadline}>Instant cargo delivery across India — at your fingertips</Text>
        </View>
      </Animated.View>

      {/* Animation Area */}
      <View style={styles.animationArea}>
        {/* Truck Container */}
        <Animated.View style={[styles.truckContainer, { transform: [{ translateX: truckAnim }] }]}>
          {/* Fading Motion Lines */}
          <View style={styles.motionLinesContainer}>
            <View style={[styles.motionLine, styles.motionLine1]} />
            <View style={[styles.motionLine, styles.motionLine2]} />
            <View style={[styles.motionLine, styles.motionLine3]} />
          </View>

          {/* Flat Design Cargo Truck */}
          <View style={styles.truck}>
            {/* Cargo Box (White/Silver Trailer) */}
            <View style={styles.trailer}>
              <View style={styles.cargoLogo}>
                <Text style={styles.cargoLogoText}>C</Text>
              </View>
            </View>
            
            {/* Cab Connector */}
            <View style={styles.connector} />
            
            {/* Driver Cab (Coral) */}
            <View style={styles.cab}>
              {/* Window */}
              <View style={styles.window} />
              {/* Bumper */}
              <View style={styles.bumper} />
            </View>
            
            {/* Wheels */}
            <View style={[styles.wheel, styles.wheel1]} />
            <View style={[styles.wheel, styles.wheel2]} />
            <View style={[styles.wheel, styles.wheel3]} />
          </View>
        </Animated.View>

        {/* Animated Dashed Road */}
        <View style={styles.roadContainer}>
          <View style={styles.roadSurface}>
            <Animated.View style={[styles.dashedContainer, { transform: [{ translateX: roadAnim }] }]}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={styles.roadDash} />
              ))}
            </Animated.View>
          </View>
          <View style={styles.roadBase} />
        </View>
      </View>

      {/* Bottom Interactive Area */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <View style={styles.buttonStack}>
          <GradientButton 
            title="Book a Truck Now" 
            onPress={() => handleStart('USER')}
            variant="primary"
            style={styles.primaryBtn}
          />
          
          <TouchableOpacity 
            style={styles.secondaryBtn}
            onPress={() => handleStart('DRIVER')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>I'm a Driver</Text>
          </TouchableOpacity>
        </View>

        {/* Bouncing scroll hint */}
        <Animated.View style={[styles.scrollHint, { transform: [{ translateY: bounceAnim }] }]}>
          <ChevronDown size={20} color={theme.colors.text.muted} />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.glow,
  },
  logoText: {
    fontFamily: theme.typography.display.fontFamily,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  headlineContainer: {
    alignItems: 'center',
    gap: 12,
  },
  headline: {
    fontFamily: theme.typography.display.fontFamily,
    fontSize: 34,
    fontWeight: '800',
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 42,
  },
  subheadline: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
  
  // Animation Styles
  animationArea: {
    height: 180,
    justifyContent: 'flex-end',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  truckContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'absolute',
    bottom: 30,
    left: 0,
    height: 60,
  },
  motionLinesContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    height: 30,
    marginRight: 6,
    marginBottom: 8,
  },
  motionLine: {
    height: 2,
    backgroundColor: theme.colors.brand.primary,
    borderRadius: 1,
    opacity: 0.4,
  },
  motionLine1: { width: 30 },
  motionLine2: { width: 15, opacity: 0.25 },
  motionLine3: { width: 20 },
  
  // Flat Truck Drawing
  truck: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 45,
    width: 110,
    position: 'relative',
  },
  trailer: {
    width: 65,
    height: 35,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cargoLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cargoLogoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  connector: {
    width: 8,
    height: 6,
    backgroundColor: '#64748B',
    marginBottom: 2,
  },
  cab: {
    width: 28,
    height: 28,
    backgroundColor: theme.colors.brand.primary, // Coral Cab
    borderTopRightRadius: 8,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    position: 'relative',
    marginBottom: 2,
  },
  window: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    backgroundColor: '#1E293B',
    borderTopRightRadius: 3,
  },
  bumper: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 6,
    height: 4,
    backgroundColor: '#64748B',
    borderRadius: 1,
  },
  wheel: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#94A3B8',
    bottom: -6,
  },
  wheel1: { left: 10 },
  wheel2: { left: 45 },
  wheel3: { left: 80 },

  // Road
  roadContainer: {
    width: '100%',
    height: 30,
  },
  roadSurface: {
    width: '100%',
    height: 6,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  dashedContainer: {
    flexDirection: 'row',
    width: width + 80,
  },
  roadDash: {
    width: 20,
    height: 2,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 10,
    marginTop: 2,
  },
  roadBase: {
    width: '100%',
    height: 24,
    backgroundColor: '#0F172A',
  },

  // Bottom Area
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    gap: 24,
  },
  buttonStack: {
    width: '100%',
    gap: 16,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border.subtle,
    backgroundColor: 'rgba(22, 24, 36, 0.6)',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 15,
    fontWeight: '600',
  },
  scrollHint: {
    marginTop: 8,
  },
});
