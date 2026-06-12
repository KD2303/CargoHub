import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import { theme } from '../theme/theme';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { getSocket } from '../services/socket';
import { Phone, MessageSquare, ShieldAlert } from 'lucide-react-native';

export const ActiveTripScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const { themeMode } = useTheme();
  const [booking, setBooking] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data.data);
      } catch (e) {
        console.error('Error fetching booking', e);
      }
    };
    fetchBooking();

    const socket = getSocket();
    if (socket) {
      socket.emit('join:booking', { bookingId });

      socket.on('booking:status', (data) => {
        if (data.bookingId === bookingId) {
          fetchBooking(); // Refresh data
        }
      });

      socket.on('booking:accepted', (data) => {
        fetchBooking();
      });

      socket.on('driver:location', (data: any) => {
        setDriverLocation({ lat: data.lat, lng: data.lng });
      });

      return () => {
        socket.off('booking:status');
        socket.off('booking:accepted');
        socket.off('driver:location');
      };
    }
  }, [bookingId]);

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Trip Details...</Text>
      </View>
    );
  }

  const pickupLat = booking.pickupLocation?.coordinates?.[1] || 26.8467;
  const pickupLng = booking.pickupLocation?.coordinates?.[0] || 80.9462;
  const dropLat = booking.dropoffLocation?.coordinates?.[1] || 26.8722;
  const dropLng = booking.dropoffLocation?.coordinates?.[0] || 80.9908;

  const driver = booking.driver;
  const isDriverAssigned = !!driver;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: pickupLat,
          longitude: pickupLng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <UrlTile
          urlTemplate={`https://api.olamaps.io/tiles/v1/styles/default-${themeMode}-standard/{z}/{x}/{y}.png?api_key=${(process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY || '').replace(/"/g, '')}`}
          maximumZ={19}
          flipY={false}
          shouldReplaceMapContent={true}
        />
        <Marker 
          coordinate={{ latitude: pickupLat, longitude: pickupLng }} 
          title="Pickup"
        />
        <Marker 
          coordinate={{ latitude: dropLat, longitude: dropLng }} 
          title="Dropoff"
          pinColor="blue"
        />
        {isDriverAssigned && (driverLocation || driver?.currentLat) && (
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

      <View style={styles.panel}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>

        {booking.otp && booking.status !== 'IN_PROGRESS' && booking.status !== 'COMPLETED' && (
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Provide this OTP to driver</Text>
            <Text style={styles.otpValue}>{booking.otp}</Text>
          </View>
        )}

        {isDriverAssigned ? (
          <View style={styles.driverInfo}>
            <View style={styles.driverProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{driver.name[0]}</Text>
              </View>
              <View>
                <Text style={styles.driverName}>{driver.name}</Text>
                <Text style={styles.vehicleDetails}>{driver.vehicleNumber} • {driver.vehicleType}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Phone size={20} color={theme.colors.brand.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Waiting for a driver to accept...</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.safetyBtn}
          onPress={() => navigation.navigate('Main')}
        >
          <ShieldAlert size={20} color={theme.colors.text.muted} />
          <Text style={styles.safetyText}>Safety & SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    color: theme.colors.text.muted,
  },
  map: {
    flex: 1,
  },
  panel: {
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    marginTop: -20,
    ...theme.shadows.card,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    color: theme.colors.brand.secondary,
    fontWeight: 'bold',
  },
  otpContainer: {
    backgroundColor: theme.colors.background.tertiary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  otpLabel: {
    color: theme.colors.text.muted,
    marginBottom: 4,
  },
  otpValue: {
    color: theme.colors.text.primary,
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  driverInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.subtle,
    marginBottom: 16,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(216, 90, 48, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.brand.primary,
    fontWeight: 'bold',
    fontSize: 20,
  },
  driverName: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleDetails: {
    color: theme.colors.text.muted,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(216, 90, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  waitingText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  safetyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  safetyText: {
    color: theme.colors.text.muted,
    fontSize: 16,
  },
});
