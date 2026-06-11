import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapViewOriginal, { Marker as MarkerOriginal, Polyline as PolylineOriginal, UrlTile as UrlTileOriginal } from 'react-native-maps';
import { theme } from '../theme/theme';
import { api } from '../services/api';
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
  { id: 'ACCEPTED', label: 'Heading to Pickup' },
  { id: 'DRIVER_ARRIVING', label: 'Arriving' },
  { id: 'ARRIVED', label: 'Driver Arrived' },
  { id: 'PICKED_UP', label: 'Loaded' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'DELIVERED', label: 'Delivered' },
];

export const CustomerActiveTripScreen = ({ route, navigation }: any) => {
  // Can get bookingId from route params or context
  const { activeBooking } = useDriver();
  const bookingId = route?.params?.bookingId || activeBooking?.id;
  const [booking, setBooking] = useState<any>(activeBooking || null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const { socket } = useSocket();

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
  
  const currentStepIndex = STEPS.findIndex(s => s.id === booking.status);
  
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
        mapType="none"
      >
        <UrlTile
          urlTemplate="https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/static/{z}/{x}/{y}.png?api_key=YOUR_OLA_KEY"
          maximumZ={19}
          flipY={false}
        />
        
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
        <Text style={styles.topStatusText}>
          {booking.status === 'PENDING' ? 'Waiting for driver to accept...' : 
           booking.status === 'DELIVERED' ? 'Trip Completed' : 
           `Driver is on the way`}
        </Text>
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
                  <Text style={styles.driverName}>{driver.name} <Text style={{ color: theme.colors.brand.warning }}>★ {driver.rating || '4.8'}</Text></Text>
                  <Text style={styles.vehicleDetails}>{driver.vehicleType} • {driver.vehicleNumber}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionBtn}>
                <Phone size={20} color="white" />
              </TouchableOpacity>
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
              <TouchableOpacity style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel Booking</Text>
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
  
  topStatusBar: { position: 'absolute', top: 60, left: 20, right: 20, backgroundColor: theme.colors.background.card, padding: 16, borderRadius: theme.radius.md, alignItems: 'center', ...theme.shadows.card, borderWidth: 1, borderColor: theme.colors.border.subtle },
  topStatusText: { color: theme.colors.text.primary, fontSize: 16, fontWeight: 'bold' },

  panel: { backgroundColor: theme.colors.background.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, marginTop: -20, ...theme.shadows.card },
  handle: { width: 40, height: 4, backgroundColor: theme.colors.border.subtle, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  driverInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  driverProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.background.tertiary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.brand.primary },
  avatarText: { color: theme.colors.brand.primary, fontWeight: 'bold', fontSize: 20 },
  driverName: { color: theme.colors.text.primary, fontSize: 18, fontWeight: 'bold' },
  vehicleDetails: { color: theme.colors.text.muted, fontSize: 14, marginTop: 4 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.brand.primary, justifyContent: 'center', alignItems: 'center', ...theme.shadows.glow },

  otpContainer: { backgroundColor: 'rgba(55, 138, 221, 0.1)', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: theme.colors.brand.primary },
  otpLabel: { color: theme.colors.brand.primary, marginBottom: 4, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  otpValue: { color: theme.colors.brand.primary, fontSize: 28, fontWeight: 'bold', letterSpacing: 10, fontFamily: 'monospace' },

  stepperContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingHorizontal: 0 },
  stepItem: { alignItems: 'center', width: (width - 40) / 6, position: 'relative' },
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
