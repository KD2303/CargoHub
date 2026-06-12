import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, Alert, ScrollView } from 'react-native';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Search, MapPin, Navigation as NavIcon, Clock } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { themeMode } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [pickup, setPickup] = useState('Current Location');
  const [dropoff, setDropoff] = useState('');
  const [fareEstimate, setFareEstimate] = useState<any>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const handleGetEstimate = async () => {
    if (!dropoff) {
      Alert.alert('Please enter a dropoff location');
      return;
    }
    // Mock estimate for MVP
    setFareEstimate({
      vehicleType: 'MINI',
      estimatedFare: 250,
      distance: '15 km',
      duration: '30 mins'
    });
  };

  const handleBook = async () => {
    try {
      const response = await api.post('/bookings', {
        pickupLocation: { type: 'Point', coordinates: [location?.coords.longitude || 0, location?.coords.latitude || 0] },
        dropoffLocation: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Mock coordinates
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        vehicleType: fareEstimate.vehicleType,
        fareEstimate: fareEstimate.estimatedFare,
      });
      Alert.alert('Booking Created', 'Finding a driver...');
      navigation.navigate('ActiveTrip', { bookingId: response.data.data.id });
    } catch (e) {
      console.log('Error creating booking', e);
      Alert.alert('Error', 'Could not create booking');
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          mapType="none"
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
        >
          <UrlTile
            urlTemplate={`https://api.olamaps.io/tiles/v1/styles/default-${themeMode}-standard/{z}/{x}/{y}.png?api_key=${(process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY || '').replace(/"/g, '')}`}
            maximumZ={19}
            flipY={false}
            shouldReplaceMapContent={true}
          />
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>Loading Map...</Text>
        </View>
      )}

      {/* Floating Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
        </View>
      </View>

      {/* Bottom Sheet for Booking */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        
        <Text style={styles.greeting}>Where to, {user?.name?.split(' ')[0] || 'User'}?</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.iconContainer}>
            <MapPin size={16} color={theme.colors.brand.primary} />
            <View style={styles.line} />
            <NavIcon size={16} color={theme.colors.brand.secondary} />
          </View>
          <View style={styles.inputs}>
            <TextInput
              style={styles.input}
              value={pickup}
              onChangeText={setPickup}
              placeholder="Pickup Location"
              placeholderTextColor={theme.colors.text.muted}
            />
            <View style={styles.divider} />
            <TextInput
              style={styles.input}
              value={dropoff}
              onChangeText={setDropoff}
              placeholder="Dropoff Location"
              placeholderTextColor={theme.colors.text.muted}
            />
          </View>
        </View>

        {!fareEstimate ? (
          <TouchableOpacity style={styles.estimateBtn} onPress={handleGetEstimate}>
            <Search color="white" size={20} />
            <Text style={styles.btnText}>Find Ride</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.estimateContainer}>
            <View style={styles.estimateDetails}>
              <Text style={styles.vehicleType}>{fareEstimate.vehicleType}</Text>
              <Text style={styles.fare}>₹{fareEstimate.estimatedFare}</Text>
            </View>
            <View style={styles.estimateMeta}>
              <Text style={styles.metaText}>{fareEstimate.distance} • {fareEstimate.duration}</Text>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
              <Text style={styles.btnText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  placeholderText: {
    color: theme.colors.text.muted,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  avatarText: {
    color: theme.colors.brand.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: theme.colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    ...theme.shadows.card,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border.subtle,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 10,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border.subtle,
    marginVertical: 4,
  },
  inputs: {
    flex: 1,
  },
  input: {
    color: theme.colors.text.primary,
    paddingVertical: 12,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.subtle,
  },
  estimateBtn: {
    backgroundColor: theme.colors.brand.primary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  estimateContainer: {
    gap: 12,
  },
  estimateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  fare: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.brand.primary,
  },
  estimateMeta: {
    marginBottom: 10,
  },
  metaText: {
    color: theme.colors.text.muted,
  },
  bookBtn: {
    backgroundColor: theme.colors.brand.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});
