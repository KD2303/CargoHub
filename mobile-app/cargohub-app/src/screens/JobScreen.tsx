// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Linking, Image, Alert, Animated, Easing, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { theme } from '../theme/theme';
import { useDriver } from '../context/DriverContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { getMapTileUrl } from '../services/mapConfig';
import { StepIndicator } from '../components/StepIndicator';
import { GradientButton } from '../components/GradientButton';
import { Header } from '../components/Header';
import * as ImagePicker from 'expo-image-picker';
import { Phone, MapPin, Navigation as NavIcon, CheckCircle2, Image as ImageIcon, Star } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Premium Dark Map Style
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#0d0f1a" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0d0f1a" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#6b7280" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#2a2d3e" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#161824" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#2a2d3e" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca3af" }] },
  { "featureType": "transit", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#090b11" }] }
];

export const JobScreen = ({ navigation }: any) => {
  const { activeBooking, setActiveBooking, driver } = useDriver();
  const { socket } = useSocket();
  const { themeMode } = useTheme();
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [mapTileUrl, setMapTileUrl] = useState('');

  useEffect(() => {
    setMapTileUrl(getMapTileUrl(themeMode));
  }, [themeMode]);
  
  // Animation values for Completed Celebration Screen
  const checkScale = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!activeBooking) {
      navigation.navigate('Main');
    }
  }, [activeBooking]);

  // Determine current step index based on activeBooking status and deliveryPhoto
  const getStepFromStatus = () => {
    if (!activeBooking) return 0;
    switch (activeBooking.status) {
      case 'ACCEPTED':
      case 'DRIVER_ARRIVING':
        return 0;
      case 'ARRIVED':
      case 'PICKED_UP':
        return 1;
      case 'IN_TRANSIT':
        return deliveryPhoto ? 3 : 2;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const step = getStepFromStatus();

  // Auto-transition ACCEPTED to DRIVER_ARRIVING and listen to cancellation
  useEffect(() => {
    if (!activeBooking || !socket) return;

    // Join the booking room
    socket.emit('join:booking', { bookingId: activeBooking.id });

    // Auto-transition from ACCEPTED to DRIVER_ARRIVING
    if (activeBooking.status === 'ACCEPTED') {
      socket.emit('booking:status', { bookingId: activeBooking.id, status: 'DRIVER_ARRIVING' });
      setActiveBooking((prev: any) => prev ? { ...prev, status: 'DRIVER_ARRIVING' } : null);
    }

    // Listen to cancellations
    const handleCancelled = (data: any) => {
      Alert.alert('Booking Cancelled', `This booking was cancelled: ${data.reason || 'No reason provided.'}`);
      setActiveBooking(null);
    };

    const handlePaymentSuccess = (data: any) => {
      if (data.bookingId === activeBooking.id) {
        Alert.alert('Payment Received! 💰', 'The customer has successfully completed the payment via Razorpay.');
      }
    };

    socket.on('booking:cancelled', handleCancelled);
    socket.on('payment:success', handlePaymentSuccess);

    return () => {
      socket.off('booking:cancelled', handleCancelled);
      socket.off('payment:success', handlePaymentSuccess);
    };
  }, [socket, activeBooking?.id]);

  useEffect(() => {
    if (step === 4) {
      // Run celebration animations
      Animated.sequence([
        Animated.spring(checkScale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(contentFade, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [step]);

  if (!activeBooking) return null;

  const handleNextStep = async () => {
    if (!socket) return;

    if (step === 0) {
      // Heading -> Arrived
      socket.emit('booking:status', { bookingId: activeBooking.id, status: 'ARRIVED' });
      setActiveBooking((prev: any) => prev ? { ...prev, status: 'ARRIVED' } : null);
    } else if (step === 1) {
      // Arrived -> Picked Up -> In Transit
      socket.emit('booking:status', { bookingId: activeBooking.id, status: 'PICKED_UP' });
      socket.emit('booking:status', { bookingId: activeBooking.id, status: 'IN_TRANSIT' });
      setActiveBooking((prev: any) => prev ? { ...prev, status: 'IN_TRANSIT' } : null);
    } else if (step === 2) {
      // Stage 2: In Transit -> Upload Delivery Photo
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to upload a delivery photo.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setDeliveryPhoto(result.assets[0].uri);
      }
    } else if (step === 3) {
      // In Transit (with Photo) -> Delivered
      socket.emit('booking:status', { bookingId: activeBooking.id, status: 'DELIVERED' });
      setActiveBooking((prev: any) => prev ? { ...prev, status: 'DELIVERED' } : null);
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 0: return "I've Arrived at Pickup";
      case 1: return "Cargo Loaded — Start Delivery";
      case 2: return "Upload Delivery Photo 📷";
      case 3: return "Complete Job ✓";
      default: return "Complete Job ✓";
    }
  };

  const handleGoDashboard = () => {
    // Complete the booking in state
    setActiveBooking(null);
  };

  // Check if we are showing Screen 7: Job Completed
  if (step === 4) {
    return (
      <View style={styles.celebrationContainer}>
        {/* Checkmark expand animation */}
        <Animated.View style={[styles.checkWrapper, { transform: [{ scale: checkScale }] }]}>
          <CheckCircle2 size={100} color={theme.colors.brand.secondary} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View style={{ opacity: contentFade, alignItems: 'center', width: '100%' }}>
          <Text style={styles.celebrationTitle}>Job Completed! 🎉</Text>
          
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fare Earned</Text>
              <Text style={styles.summaryFare}>₹{activeBooking.finalFare || activeBooking.fareEstimate}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRoute}>
              <View style={styles.routeDotContainer}>
                <View style={[styles.routeDot, { backgroundColor: theme.colors.brand.primary }]} />
                <View style={styles.routeLine} />
                <View style={[styles.routeDot, { backgroundColor: theme.colors.brand.secondary }]} />
              </View>
              <View style={styles.routeDetails}>
                <Text style={styles.routeText} numberOfLines={1}>From: {activeBooking.pickupAddress}</Text>
                <Text style={[styles.routeText, { marginTop: 12 }]} numberOfLines={1}>To: {activeBooking.dropAddress}</Text>
              </View>
            </View>

            <View style={styles.summaryDetails}>
              <Text style={styles.summaryDetailText}>Cargo: {activeBooking.loadType}</Text>
              <Text style={styles.summaryDetailText}>Distance: 4.2 km</Text>
            </View>

            {/* Delivery photo preview if uploaded */}
            {deliveryPhoto && (
              <View style={styles.deliveryPhotoWrapper}>
                <Text style={styles.photoLabel}>Delivery Proof</Text>
                <Image source={{ uri: deliveryPhoto }} style={styles.deliveryPhotoThumb} />
              </View>
            )}
          </View>

          {/* Rating received placeholder */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Rating received</Text>
            <View style={styles.starsRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={28} color="#4A4E69" fill="#4A4E69" style={{ marginHorizontal: 4 }} />
              ))}
            </View>
            <Text style={styles.ratingPending}>Waiting for customer rating...</Text>
          </View>

          {/* Go to Dashboard button */}
          <GradientButton 
            title="Go to Dashboard" 
            onPress={handleGoDashboard}
            variant="coral"
            style={styles.dashboardBtn}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Active Job" />
      
      {/* Mapbox/Google Maps Integration with Ola Maps Tiles */}
      <MapView
        mapType="none"
        style={styles.map}
        mapType={mapTileUrl ? 'none' : 'standard'}
        customMapStyle={mapTileUrl ? undefined : darkMapStyle}
        initialRegion={{
          latitude: activeBooking.pickupLat,
          longitude: activeBooking.pickupLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {mapTileUrl ? (
          <UrlTile 
            urlTemplate={mapTileUrl}
            maximumZ={19}
            shouldReplaceMapContent={true}
          />
        ) : null}
        <Polyline
          coordinates={[
            { latitude: activeBooking.pickupLat, longitude: activeBooking.pickupLng },
            { latitude: activeBooking.dropLat, longitude: activeBooking.dropLng }
          ]}
          strokeColor={theme.colors.brand.primary}
          strokeWidth={4}
          lineDashPattern={[10, 8]}
        />

        {/* Pickup Pin */}
        <Marker coordinate={{ latitude: activeBooking.pickupLat, longitude: activeBooking.pickupLng }}>
          <View style={[styles.marker, { backgroundColor: theme.colors.brand.primary }]}>
            <MapPin size={16} color="white" />
          </View>
        </Marker>
        
        {/* Drop Pin */}
        <Marker coordinate={{ latitude: activeBooking.dropLat, longitude: activeBooking.dropLng }}>
          <View style={[styles.marker, { backgroundColor: theme.colors.brand.secondary }]}>
            <NavIcon size={16} color="white" />
          </View>
        </Marker>

        {/* Pulsing Driver Location Dot */}
        {driver?.currentLat && driver?.currentLng && (
          <Marker coordinate={{ latitude: driver.currentLat, longitude: driver.currentLng }}>
            <View style={styles.driverPulseWrapper}>
              <View style={styles.driverPulseRing} />
              <View style={styles.driverDot} />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.bottomSheet}>
        {/* Drag handle placeholder */}
        <View style={styles.dragHandle} />
        
        {/* Horizontal progress stepper */}
        <StepIndicator currentStep={step} />
        
        <View style={styles.customerCard}>
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {activeBooking.userName ? activeBooking.userName[0] : 'C'}
              </Text>
            </View>
            <View>
              <Text style={styles.customerName}>{activeBooking.userName || 'Customer'}</Text>
              <Text style={styles.customerDetails}>{activeBooking.loadType} • ₹{activeBooking.fareEstimate}</Text>
            </View>
          </View>
          
          <GradientButton 
            title="" 
            icon={<Phone size={20} color="white" />} 
            variant="coral" 
            onPress={() => Linking.openURL(`tel:+919999999999`)} 
            style={styles.callBtn} 
          />
        </View>

        {/* Proof of delivery photo preview if available */}
        {step === 3 && deliveryPhoto && (
          <View style={styles.uploadedProofRow}>
            <ImageIcon size={18} color={theme.colors.brand.secondary} />
            <Text style={styles.proofText}>Delivery proof photo captured successfully</Text>
          </View>
        )}

        {/* Primary Action Button */}
        <GradientButton 
          title={getButtonText()} 
          onPress={handleNextStep} 
          variant={step === 3 ? 'secondary' : 'coral'} 
          style={styles.actionBtn} 
          textStyle={step === 3 ? { color: theme.colors.brand.secondary, fontWeight: 'bold' } : undefined}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  map: { flex: 1 },
  marker: { padding: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#FFFFFF', ...theme.shadows.sm },
  
  // Driver Pulse Marker
  driverPulseWrapper: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  driverPulseRing: { position: 'absolute', width: 24, height: 24, borderRadius: 12, borderStyle: 'solid', borderWidth: 2, borderColor: theme.colors.brand.primary, backgroundColor: 'rgba(216, 90, 48, 0.15)', transform: [{ scale: 1.25 }] },
  driverDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.brand.primary, borderWidth: 2, borderColor: '#FFFFFF' },
  
  // Bottom Sheet
  bottomSheet: { backgroundColor: theme.colors.background.card, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, paddingHorizontal: theme.spacing.lg, paddingBottom: 40, paddingTop: 10, ...theme.shadows.md, borderTopWidth: 1, borderTopColor: theme.colors.border.subtle },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.border.subtle, alignSelf: 'center', marginBottom: 12 },
  customerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.background.tertiary, padding: theme.spacing.md, borderRadius: theme.radius.lg, marginVertical: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border.subtle },
  customerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(56, 189, 248, 0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.brand.secondary },
  avatarText: { fontFamily: theme.typography.display.fontFamily, color: theme.colors.brand.secondary, fontSize: 18, fontWeight: 'bold' },
  customerName: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 15, color: theme.colors.text.primary, fontWeight: 'bold' },
  customerDetails: { fontFamily: theme.typography.body.fontFamily, fontSize: 12, color: theme.colors.text.muted, marginTop: 2 },
  callBtn: { width: 44, height: 44, borderRadius: 22, paddingHorizontal: 0, paddingVertical: 0 },
  uploadedProofRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, alignSelf: 'center' },
  proofText: { fontSize: 12, color: theme.colors.brand.secondary, fontWeight: '600' },
  actionBtn: { marginTop: 8 },

  // Screen 7: Celebration Screen Styles
  celebrationContainer: { flex: 1, backgroundColor: theme.colors.background.primary, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
  checkWrapper: { marginBottom: 20 },
  celebrationTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 24, fontFamily: theme.typography.display.fontFamily },
  summaryCard: { width: '100%', backgroundColor: theme.colors.background.card, borderRadius: theme.radius.xl, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, ...theme.shadows.md, marginBottom: 24 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: theme.colors.text.muted, fontWeight: '600' },
  summaryFare: { fontSize: 30, fontWeight: 'bold', color: theme.colors.brand.secondary, fontFamily: theme.typography.mono.fontFamily },
  summaryDivider: { height: 1, backgroundColor: theme.colors.border.subtle, marginVertical: 16 },
  summaryRoute: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  routeDotContainer: { alignItems: 'center', paddingTop: 4 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeLine: { width: 1.5, height: 20, backgroundColor: theme.colors.border.subtle, marginVertical: 2 },
  routeDetails: { flex: 1 },
  routeText: { fontSize: 13, color: theme.colors.text.primary },
  summaryDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  summaryDetailText: { fontSize: 12, color: theme.colors.text.muted, fontWeight: '500' },
  deliveryPhotoWrapper: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.colors.border.subtle },
  photoLabel: { fontSize: 12, color: theme.colors.text.muted, marginBottom: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  deliveryPhotoThumb: { width: '100%', height: 120, borderRadius: theme.radius.md, resizeMode: 'cover' },
  ratingSection: { alignItems: 'center', marginBottom: 32 },
  ratingLabel: { fontSize: 12, color: theme.colors.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  starsRow: { flexDirection: 'row', marginBottom: 8 },
  ratingPending: { fontSize: 12, color: theme.colors.text.muted, fontStyle: 'italic' },
  dashboardBtn: { width: '100%' },
});
