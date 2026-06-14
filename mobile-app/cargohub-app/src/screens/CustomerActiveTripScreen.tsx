import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapViewOriginal, { Marker as MarkerOriginal, Polyline as PolylineOriginal, UrlTile as UrlTileOriginal } from 'react-native-maps';
import { theme } from '../theme/theme';
import { api } from '../services/api';
import { getMapTileUrl } from '../services/mapConfig';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useDriver } from '../context/DriverContext';
import { Phone as PhoneIcon, CheckCircle2 as CheckCircle2Icon } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const MapView = MapViewOriginal as any;
const Marker = MarkerOriginal as any;
const Polyline = PolylineOriginal as any;
const UrlTile = UrlTileOriginal as any;
const Phone = PhoneIcon as any;
const CheckCircle2 = CheckCircle2Icon as any;

const { width } = Dimensions.get('window');

const STEPS = [
  { id: 'PENDING', label: 'Booking Confirmed' },
  { id: 'ACCEPTED', label: 'Driver Assigned' },
  { id: 'ARRIVED', label: 'Arrived at Pickup' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'DELIVERED', label: 'Delivered' },
];

export const CustomerActiveTripScreen = ({ route, navigation }: any) => {
  const { themeMode } = useTheme();
  // Can get bookingId from route params or context
  const { activeBooking } = useDriver();
  const bookingId = route?.params?.bookingId || activeBooking?.id;
  const [booking, setBooking] = useState<any>(activeBooking || null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapTileUrl, setMapTileUrl] = useState('');
  
  const { socket } = useSocket();

  useEffect(() => {
    setMapTileUrl(getMapTileUrl(themeMode));
  }, [themeMode]);

  useEffect(() => {
    if (!bookingId) {
      navigation.goBack();
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        const data = response.data?.data;
        if (data) {
          setBooking(data);
          if (data.status === 'DELIVERED') {
            navigation.navigate('CustomerPayment', { bookingId: data.id });
          }
        }
      } catch (e) {
        console.error('Error fetching booking', e);
      }
    };
    fetchBooking();

    if (socket) {
      // Ensure we are in the room
      socket.emit('join:booking', { bookingId });

      socket.on('booking:status', (data: any) => {
        if (data.bookingId === bookingId) {
          fetchBooking(); // Refresh full booking data to get OTP etc
        }
      });

      socket.on('driver:location', (data: any) => {
        setDriverLocation({ lat: data.lat, lng: data.lng });
      });

      return () => {
        socket.off('booking:status');
        socket.off('driver:location');
      };
    }
  }, [bookingId, socket]);

  const [isCancelling, setIsCancelling] = useState(false);
  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`, {
        reason: 'User requested cancellation via App'
      });
      setIsCancelling(false);
      navigation.navigate('CustomerMain');
    } catch (error) {
      setIsCancelling(false);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.loadingText}>Loading Trip Details...</Text>
      </View>
    );
  }

  const driver = booking.driver;
  const isDriverAssigned = !!driver;
  
  // Calculate current step based on web logic
  let currentStepIndex = 0;
  if (booking.status !== 'PENDING') currentStepIndex = 1;
  if (['ARRIVED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(booking.status)) currentStepIndex = 2;
  if (['IN_TRANSIT', 'DELIVERED'].includes(booking.status)) currentStepIndex = 3;
  if (booking.status === 'DELIVERED') currentStepIndex = 4;
  
  // Safe coordinates fallback
  const pickupLat = booking.pickupLat || booking.pickupLocation?.coordinates?.[1] || 26.8467;
  const pickupLng = booking.pickupLng || booking.pickupLocation?.coordinates?.[0] || 80.9462;
  const dropLat = booking.dropLat || booking.dropoffLocation?.coordinates?.[1] || 26.8722;
  const dropLng = booking.dropLng || booking.dropoffLocation?.coordinates?.[0] || 80.9908;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: pickupLat,
          longitude: pickupLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        mapType={mapTileUrl ? 'none' : 'standard'}
      >
        {mapTileUrl ? (
          <UrlTile
            urlTemplate={mapTileUrl}
            maximumZ={19}
            flipY={false}
            shouldReplaceMapContent={true}
          />
        ) : null}
        
        <Marker coordinate={{ latitude: pickupLat, longitude: pickupLng }} title="Pickup" />
        <Marker coordinate={{ latitude: dropLat, longitude: dropLng }} title="Dropoff" pinColor={theme.colors.brand.primary} />
        
        {isDriverAssigned && (driverLocation || driver.currentLat) && (
          <Marker 
            coordinate={{ 
              latitude: driverLocation?.lat || driver.currentLat, 
              longitude: driverLocation?.lng || driver.currentLng 
            }} 
            title="Driver"
            pinColor={theme.colors.brand.secondary}
          />
        )}
        
        <Polyline 
          coordinates={[
            { latitude: pickupLat, longitude: pickupLng },
            { latitude: dropLat, longitude: dropLng }
          ]}
          strokeColor={theme.colors.brand.primary}
          strokeWidth={4}
        />
      </MapView>

      {/* Top Floating Status Bar */}
      <View style={styles.topStatusBar}>
        <View>
          <Text style={styles.topStatusTitle}>Track Shipment</Text>
          <Text style={styles.topStatusId}>ID: {booking.id?.substring(0, 8)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusBadgeText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.handle} />

        {isDriverAssigned ? (
          <>
            <View style={styles.driverInfo}>
              <View style={styles.driverProfile}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{driver.name?.[0] || 'D'}</Text>
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                  <Text style={styles.vehicleDetails}>
                    <Text style={{ color: theme.colors.brand.warning, fontWeight: 'bold' }}>★ {driver.rating || '4.8'} </Text>
                    ({driver.vehicleNumber})
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionBtn}>
                <Phone size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Speed & Fare Grid */}
            <View style={styles.speedFareGrid}>
              <View style={styles.speedFareCard}>
                <Text style={styles.speedFareLabel}>Speed</Text>
                <Text style={styles.speedFareValue}>~{driverLocation ? '32 km/h' : '--'}</Text>
              </View>
              <View style={styles.speedFareCard}>
                <Text style={styles.speedFareLabel}>Fare</Text>
                <Text style={styles.speedFareValue}>₹{booking.fareEstimate || booking.finalFare || 0}</Text>
              </View>
            </View>

            {booking.otp && (booking.status === 'ACCEPTED' || booking.status === 'DRIVER_ARRIVING' || booking.status === 'ARRIVED') && (
              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>Provide this OTP to driver upon arrival</Text>
                <Text style={styles.otpValue}>{booking.otp}</Text>
              </View>
            )}

            {/* Stepper */}
            <View style={styles.stepperContainer}>
              {STEPS.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <View key={step.id} style={styles.stepItem}>
                    <View style={[styles.stepCircle, isActive && styles.stepCircleActive, isCompleted && styles.stepCircleCompleted]}>
                      {isCompleted ? <CheckCircle2 size={12} color="white" /> : <Text style={[styles.stepNumber, (isActive || isCompleted) && styles.stepNumberActive]}>{index + 1}</Text>}
                    </View>
                    <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]} numberOfLines={2}>{step.label}</Text>
                    {index < STEPS.length - 1 && <View style={[styles.stepLine, isCompleted && styles.stepLineCompleted]} />}
                  </View>
                );
              })}
            </View>

            {(booking.status === 'PENDING' || booking.status === 'ACCEPTED' || booking.status === 'DRIVER_ARRIVING') && (
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelBooking} disabled={isCancelling}>
                <Text style={styles.cancelText}>{isCancelling ? 'Cancelling...' : 'Cancel Booking'}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Finding a driver near you...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary },
  loadingText: { color: theme.colors.text.muted },
  map: { flex: 1 },
  
  topStatusBar: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: theme.colors.background.card, padding: 16, borderRadius: theme.radius.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', ...theme.shadows.card, borderWidth: 1, borderColor: theme.colors.border.subtle },
  topStatusTitle: { color: theme.colors.text.primary, fontSize: 18, fontWeight: 'bold' },
  topStatusId: { color: theme.colors.text.muted, fontSize: 12, fontFamily: 'monospace', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(55, 138, 221, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(55, 138, 221, 0.2)' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.brand.primary, marginRight: 6 },
  statusBadgeText: { color: theme.colors.brand.primary, fontSize: 12, fontWeight: 'bold' },

  panel: { backgroundColor: theme.colors.background.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, marginTop: -20, ...theme.shadows.card },
  handle: { width: 40, height: 4, backgroundColor: theme.colors.border.subtle, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  driverInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  driverProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(55, 138, 221, 0.1)', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: theme.colors.brand.primary, fontWeight: 'bold', fontSize: 20 },
  driverName: { color: theme.colors.text.primary, fontSize: 16, fontWeight: 'bold' },
  verifiedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  verifiedText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
  vehicleDetails: { color: theme.colors.text.muted, fontSize: 13, marginTop: 4 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.background.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border.subtle },

  speedFareGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  speedFareCard: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: theme.colors.background.primary, borderWidth: 1, borderColor: theme.colors.border.subtle },
  speedFareLabel: { color: theme.colors.text.muted, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  speedFareValue: { color: theme.colors.text.primary, fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },

  otpContainer: { backgroundColor: 'rgba(55, 138, 221, 0.1)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: theme.colors.brand.primary },
  otpLabel: { color: theme.colors.brand.primary, marginBottom: 4, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  otpValue: { color: theme.colors.brand.primary, fontSize: 28, fontWeight: 'bold', letterSpacing: 10, fontFamily: 'monospace' },

  stepperContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingHorizontal: 0 },
  stepItem: { alignItems: 'center', width: (width - 40) / 5, position: 'relative' },
  stepCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: theme.colors.background.tertiary, justifyContent: 'center', alignItems: 'center', zIndex: 2, borderWidth: 1, borderColor: theme.colors.border.subtle },
  stepCircleActive: { backgroundColor: theme.colors.brand.primary, borderColor: theme.colors.brand.primary },
  stepCircleCompleted: { backgroundColor: theme.colors.brand.secondary, borderColor: theme.colors.brand.secondary },
  stepNumber: { color: theme.colors.text.muted, fontSize: 10, fontWeight: 'bold' },
  stepNumberActive: { color: 'white' },
  stepLabel: { color: theme.colors.text.muted, fontSize: 9, textAlign: 'center', marginTop: 8 },
  stepLabelActive: { color: theme.colors.brand.primary, fontWeight: 'bold' },
  stepLine: { position: 'absolute', top: 11, left: '50%', width: '100%', height: 2, backgroundColor: theme.colors.border.subtle, zIndex: 1 },
  stepLineCompleted: { backgroundColor: theme.colors.brand.secondary },

  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { color: theme.colors.brand.danger, fontSize: 15, fontWeight: '600' },

  waitingContainer: { paddingVertical: 40, alignItems: 'center' },
  waitingText: { color: theme.colors.text.secondary, fontSize: 16 },
});
