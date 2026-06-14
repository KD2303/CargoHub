// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, Alert, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
import MapViewOriginal, { Marker as MarkerOriginal, UrlTile as UrlTileOriginal, Polyline as PolylineOriginal } from 'react-native-maps';
const MapView = MapViewOriginal as any;
const Marker = MarkerOriginal as any;
const UrlTile = UrlTileOriginal as any;
const Polyline = PolylineOriginal as any;

import { MapPin as MapPinIcon, Navigation as NavigationIcon, ArrowLeft as ArrowLeftIcon, Weight as WeightIcon, Truck as TruckIcon, Package as PackageIcon, Users as UsersIcon, ChevronRight as ChevronRightIcon, Minus as MinusIcon, Plus as PlusIcon, IndianRupee as RupeeIcon, CheckCircle as CheckIcon, X as XIcon, Zap as ZapIcon, Home as HomeIcon, Briefcase as BriefcaseIcon } from 'lucide-react-native';
const MapPin = MapPinIcon as any;
const NavIcon = NavigationIcon as any;
const ArrowLeft = ArrowLeftIcon as any;
const WeightIc = WeightIcon as any;
const TruckIc = TruckIcon as any;
const PackageIc = PackageIcon as any;
const UsersIc = UsersIcon as any;
const ChevronRight = ChevronRightIcon as any;
const MinusIc = MinusIcon as any;
const PlusIc = PlusIcon as any;
const RupeeIc = RupeeIcon as any;
const CheckIc = CheckIcon as any;
const XIc = XIcon as any;
const ZapIc = ZapIcon as any;
const Home = HomeIcon as any;
const Briefcase = BriefcaseIcon as any;

import * as Location from 'expo-location';
import { theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { useDriver } from '../context/DriverContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { getMapTileUrl } from '../services/mapConfig';
import { GradientButton } from '../components/GradientButton';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// ── Vehicle & Load Configs (matching shared/constants) ──────────────────────

const VEHICLE_CONFIG = {
  MINI_PICKUP: { label: 'Mini Pickup', description: 'Small delivery', capacity: 'Up to 300 kg', maxKg: 300, baseFare: 80, perKmRate: 12, icon: '🛻' },
  TATA_ACE:    { label: 'Tata Ace',    description: 'Mini truck for small loads', capacity: 'Up to 750 kg', maxKg: 750, baseFare: 100, perKmRate: 16, icon: '🛻' },
  MINI_TRUCK:  { label: 'Mini Truck',  description: 'Medium truck', capacity: 'Up to 1.5 tons', maxKg: 1500, baseFare: 180, perKmRate: 20, icon: '🚚' },
  PICKUP_TRUCK:{ label: 'Pickup Truck',description: 'Open-bed for bulk goods', capacity: 'Up to 1.5 tons', maxKg: 1500, baseFare: 200, perKmRate: 18, icon: '🚚' },
  TEMPO_407:   { label: 'Tempo 407',   description: 'Furniture & appliances', capacity: 'Up to 2.5 tons', maxKg: 2500, baseFare: 150, perKmRate: 22, icon: '🚛' },
  LARGE_TRUCK: { label: 'Large Truck', description: 'Heavy-duty relocations', capacity: 'Up to 7 tons', maxKg: 7000, baseFare: 200, perKmRate: 28, icon: '🚛' },
};

const LOAD_CONFIG = {
  BOXES_CARTONS: { label: 'Boxes & Cartons', icon: '📦', surchargePercent: 0 },
  FURNITURE:     { label: 'Furniture',       icon: '🪑', surchargePercent: 10 },
  APPLIANCES:    { label: 'Appliances',      icon: '🧊', surchargePercent: 15 },
  ELECTRONICS:   { label: 'Electronics',     icon: '💻', surchargePercent: 20 },
  FRAGILE_GOODS: { label: 'Fragile Goods',   icon: '⚠️', surchargePercent: 20 },
  BULK_GOODS:    { label: 'Bulk Goods',      icon: '🏗️', surchargePercent: 5 },
};

const HELPER_CHARGE = 150;
const GST_RATE = 0.18;

type BookingStep = 'LOCATIONS' | 'WEIGHT_VEHICLE' | 'ESTIMATE' | 'SEARCHING';

// Auto-suggest best vehicle based on weight
function suggestVehicle(weightKg: number): string {
  const sorted = Object.entries(VEHICLE_CONFIG).sort((a, b) => a[1].maxKg - b[1].maxKg);
  for (const [key, cfg] of sorted) {
    if (weightKg <= cfg.maxKg) return key;
  }
  return 'LARGE_TRUCK';
}

// ── Component ───────────────────────────────────────────────────────────────

export const CustomerHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { themeMode } = useTheme();
  const { setActiveBooking } = useDriver();
  const { socket } = useSocket();

  const [step, setStep] = useState<BookingStep>('LOCATIONS');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // Step 1: Locations
  const [pickup, setPickup] = useState('Current Location');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{lat: number, lng: number} | null>(null);

  // Step 2: Weight → Vehicle → Load → Helpers
  const [weight, setWeight] = useState('');
  const [vehicle, setVehicle] = useState('TATA_ACE');
  const [loadType, setLoadType] = useState('BOXES_CARTONS');
  const [helpers, setHelpers] = useState(0);

  // Step 3: Fare
  const [fare, setFare] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [mapTileUrl, setMapTileUrl] = useState('');
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    setMapTileUrl(getMapTileUrl(themeMode));
  }, [themeMode]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setPickupCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  // Pulse animation for searching state
  useEffect(() => {
    if (step === 'SEARCHING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [step]);

  // Auto-suggest vehicle when weight changes
  useEffect(() => {
    const w = parseFloat(weight);
    if (w > 0) {
      setVehicle(suggestVehicle(w));
    }
  }, [weight]);

  // Listen for socket events from driver
  useEffect(() => {
    if (!socket) return;
    
    const handleAccepted = (data: any) => {
      console.log('booking:accepted received:', data);
      setStep('LOCATIONS');
      Alert.alert('Driver Found! 🚛', `${data.driverName} is on the way!\nETA: ~${data.eta} mins`, [
        { text: 'Track Now', onPress: () => navigation.navigate('CustomerActiveTrip', { bookingId: data.bookingId }) }
      ]);
    };

    socket.on('booking:accepted', handleAccepted);
    return () => { socket.off('booking:accepted', handleAccepted); };
  }, [socket]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleNextToWeight = async () => {
    if (!dropoff.trim()) {
      Alert.alert('Missing Drop-off', 'Please enter a drop-off location');
      return;
    }
    
    setBookingLoading(true);
    try {
      if (pickup !== 'Current Location') {
         const pRes = await Location.geocodeAsync(pickup);
         if (pRes.length > 0) {
           setPickupCoords({ lat: pRes[0].latitude, lng: pRes[0].longitude });
         }
      }
      const dRes = await Location.geocodeAsync(dropoff);
      if (dRes.length > 0) {
        setDropoffCoords({ lat: dRes[0].latitude, lng: dRes[0].longitude });
        setStep('WEIGHT_VEHICLE');
      } else {
        Alert.alert('Location Not Found', 'Could not locate the drop-off address.');
      }
    } catch(e) {
      console.log('Geocode error:', e);
      // Fallback for mocked environment or if geocoding fails
      setDropoffCoords({ lat: 26.8722, lng: 80.9908 });
      setStep('WEIGHT_VEHICLE');
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateFare = () => {
    const vCfg = VEHICLE_CONFIG[vehicle as keyof typeof VEHICLE_CONFIG];
    const lCfg = LOAD_CONFIG[loadType as keyof typeof LOAD_CONFIG];
    const distanceKm = 12.4; // Mock distance — in production from Ola Maps Distance Matrix

    const base = vCfg.baseFare;
    const distanceCharge = Math.round(distanceKm * vCfg.perKmRate);
    const loadSurcharge = Math.round((base + distanceCharge) * lCfg.surchargePercent / 100);
    const helperCharge = helpers * HELPER_CHARGE;
    const w = parseFloat(weight) || 0;
    const weightCharge = w > 500 ? Math.round((w - 500) * 0.5) : 0;
    const subtotal = base + distanceCharge + loadSurcharge + helperCharge + weightCharge;
    const gst = Math.round(subtotal * GST_RATE);
    const total = subtotal + gst;

    setFare({
      base, distanceCharge, distanceKm, loadSurcharge, helperCharge,
      weightCharge, subtotal, gst, total, surgeMultiplier: 1.0,
    });
    setStep('ESTIMATE');
  };

  const handleConfirmBooking = async () => {
    setStep('SEARCHING');
    setBookingLoading(true);
    try {
      const payload = {
        pickupLat: pickupCoords?.lat || location?.coords.latitude || 26.8467,
        pickupLng: pickupCoords?.lng || location?.coords.longitude || 80.9462,
        pickupAddress: pickup,
        dropLat: dropoffCoords?.lat || 26.8722,
        dropLng: dropoffCoords?.lng || 80.9908,
        dropAddress: dropoff,
        vehicleType: vehicle,
        loadType: loadType,
        helpersRequested: helpers,
        weight: parseFloat(weight) || 0,
      };

      const response = await api.post('/bookings', payload);
      const booking = response.data?.data?.booking || response.data?.data;

      if (booking) {
        // Join booking socket room for live updates
        socket?.emit('join:booking', { bookingId: booking.id });
        setActiveBooking(booking);

        // Wait for driver to accept (timeout after 35s)
        setTimeout(() => {
          if (stepRef.current === 'SEARCHING') {
            Alert.alert('No Driver Found', 'No drivers available right now. Please try again.', [
              { text: 'OK', onPress: () => setStep('ESTIMATE') }
            ]);
          }
        }, 35000);
      }
    } catch (e: any) {
      console.log('Booking error:', e?.response?.data || e);
      Alert.alert('Booking Failed', e?.response?.data?.error || 'Could not create booking. Please try again.');
      setStep('ESTIMATE');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  // ── Render ────────────────────────────────────────────────────────────────

  const vCfg = VEHICLE_CONFIG[vehicle as keyof typeof VEHICLE_CONFIG];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Map Background */}
      {location ? (
        <MapView
          mapType="none"
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          mapType={mapTileUrl ? 'none' : 'standard'}
          showsUserLocation
        >
          {mapTileUrl ? (
            <UrlTile
              urlTemplate={mapTileUrl}
              maximumZ={19}
              flipY={false}
              shouldReplaceMapContent={true}
            />
          ) : null}

          {pickupCoords && (
            <Marker coordinate={{ latitude: pickupCoords.lat, longitude: pickupCoords.lng }} title="Pickup" pinColor={theme.colors.brand.primary} />
          )}

          {dropoffCoords && (
            <Marker coordinate={{ latitude: dropoffCoords.lat, longitude: dropoffCoords.lng }} title="Drop-off" pinColor={theme.colors.brand.secondary} />
          )}

          {pickupCoords && dropoffCoords && (
            <Polyline 
              coordinates={[
                { latitude: pickupCoords.lat, longitude: pickupCoords.lng },
                { latitude: dropoffCoords.lat, longitude: dropoffCoords.lng }
              ]}
              strokeColor={theme.colors.brand.primary}
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator color={theme.colors.brand.primary} />
          <Text style={{ color: theme.colors.text.muted, marginTop: 8 }}>Loading map...</Text>
        </View>
      )}

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Truck</Text>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s, i) => {
            const currentStep = step === 'LOCATIONS' ? 1 : step === 'WEIGHT_VEHICLE' ? 2 : 3;
            return (
              <View key={s} style={styles.stepRow}>
                <View style={[styles.stepDot, currentStep >= s && styles.stepDotActive]}>
                  {currentStep > s ? <CheckIc size={12} color="white" /> : <Text style={[styles.stepNum, currentStep >= s && { color: 'white' }]}>{s}</Text>}
                </View>
                {i < 2 && <View style={[styles.stepLine, currentStep > s && styles.stepLineActive]} />}
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Searching Overlay ────────────────────────────────────────────── */}
      {step === 'SEARCHING' && (
        <View style={styles.searchingOverlay}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.pulseInner}>
              <TruckIc size={36} color={theme.colors.brand.primary} />
            </View>
          </Animated.View>
          <Text style={styles.searchingText}>Finding the nearest driver...</Text>
          <Text style={styles.searchingSubtext}>Usually under 2 minutes</Text>
          <TouchableOpacity style={styles.cancelSearchBtn} onPress={() => setStep('ESTIMATE')}>
            <Text style={styles.cancelText}>Cancel Search</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Bottom Sheet ─────────────────────────────────────────────────── */}
      {step !== 'SEARCHING' && (
        <ScrollView style={styles.bottomSheet} contentContainerStyle={styles.bottomSheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.handle} />

          {/* ═══ STEP 1: Locations ═══ */}
          {step === 'LOCATIONS' && (
            <>
              <Text style={styles.stepTitle}>📍 Set Pickup & Drop-off</Text>

              <View style={styles.locationCard}>
                <View style={styles.locationRow}>
                  <View style={[styles.locationDot, { backgroundColor: theme.colors.brand.primary }]} />
                  <View style={styles.locationInput}>
                    <Text style={styles.locationLabel}>PICKUP</Text>
                    <TextInput style={styles.input} value={pickup} onChangeText={setPickup} placeholder="Enter pickup address" placeholderTextColor={theme.colors.text.muted} />
                  </View>
                </View>
                <View style={styles.locationDivider}>
                  <View style={styles.dashedLine} />
                </View>
                <View style={styles.locationRow}>
                  <View style={[styles.locationDot, { backgroundColor: theme.colors.brand.secondary }]} />
                  <View style={styles.locationInput}>
                    <Text style={styles.locationLabel}>DROP-OFF</Text>
                    <TextInput style={styles.input} value={dropoff} onChangeText={setDropoff} placeholder="Enter drop-off address" placeholderTextColor={theme.colors.text.muted} />
                  </View>
                </View>
              </View>

              {/* Saved Addresses Quick Select */}
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.colors.text.muted, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Saved Addresses</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                  <TouchableOpacity style={styles.savedPill} onPress={() => setDropoff('123 Tech Park, Cyber City, Gurgaon')}>
                    <Home size={14} color={theme.colors.text.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.savedPillText}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.savedPill} onPress={() => setDropoff('Building 14, DLF Phase 3, Gurgaon')}>
                    <Briefcase size={14} color={theme.colors.text.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.savedPillText}>Office</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              <GradientButton title="Continue →" onPress={handleNextToWeight} variant="primary" style={{ marginTop: 20 }} disabled={!dropoff.trim()} />
            </>
          )}

          {/* ═══ STEP 2: Weight → Vehicle → Load → Helpers ═══ */}
          {step === 'WEIGHT_VEHICLE' && (
            <>
              {/* Weight Input */}
              <Text style={styles.stepTitle}>⚖️ Enter Cargo Weight</Text>
              <View style={styles.weightCard}>
                <WeightIc size={24} color={theme.colors.brand.primary} />
                <TextInput
                  style={styles.weightInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="e.g. 500"
                  placeholderTextColor={theme.colors.text.muted}
                />
                <Text style={styles.weightUnit}>kg</Text>
              </View>
              {parseFloat(weight) > 0 && (
                <View style={styles.suggestBadge}>
                  <ZapIc size={14} color={theme.colors.brand.primary} />
                  <Text style={styles.suggestText}>
                    Recommended: <Text style={{ fontWeight: 'bold' }}>{vCfg.label}</Text> ({vCfg.capacity})
                  </Text>
                </View>
              )}

              {/* Vehicle Selection */}
              <Text style={[styles.stepTitle, { marginTop: 20 }]}>🚛 Choose Vehicle</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
                {Object.entries(VEHICLE_CONFIG).map(([key, cfg]) => {
                  const isSelected = vehicle === key;
                  const w = parseFloat(weight) || 0;
                  const isTooSmall = w > cfg.maxKg;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.vehicleCard, isSelected && styles.vehicleCardActive, isTooSmall && styles.vehicleCardDisabled]}
                      onPress={() => !isTooSmall && setVehicle(key)}
                      disabled={isTooSmall}
                    >
                      <Text style={styles.vehicleIcon}>{cfg.icon}</Text>
                      <Text style={[styles.vehicleName, isSelected && { color: theme.colors.brand.primary }]}>{cfg.label}</Text>
                      <Text style={styles.vehicleCap}>{cfg.capacity}</Text>
                      <Text style={[styles.vehiclePrice, isTooSmall && { color: theme.colors.text.muted }]}>₹{cfg.baseFare}+</Text>
                      {isTooSmall && <Text style={styles.tooSmallText}>Too small</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Load Type */}
              <Text style={[styles.stepTitle, { marginTop: 20 }]}>📦 What are you shipping?</Text>
              <View style={styles.loadGrid}>
                {Object.entries(LOAD_CONFIG).map(([key, cfg]) => {
                  const isSelected = loadType === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.loadPill, isSelected && styles.loadPillActive]}
                      onPress={() => setLoadType(key)}
                    >
                      <Text style={styles.loadIcon}>{cfg.icon}</Text>
                      <Text style={[styles.loadLabel, isSelected && { color: theme.colors.brand.primary, fontWeight: 'bold' }]}>{cfg.label}</Text>
                      {cfg.surchargePercent > 0 && <Text style={styles.surchargeText}>+{cfg.surchargePercent}%</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Helpers */}
              <View style={styles.helperCard}>
                <View>
                  <Text style={styles.helperTitle}>👷 Need Helpers?</Text>
                  <Text style={styles.helperSubtitle}>₹{HELPER_CHARGE} per helper for loading/unloading</Text>
                </View>
                <View style={styles.helperCounter}>
                  <TouchableOpacity style={styles.counterBtn} onPress={() => setHelpers(Math.max(0, helpers - 1))} disabled={helpers === 0}>
                    <MinusIc size={16} color={helpers === 0 ? theme.colors.text.muted : theme.colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.counterNum}>{helpers}</Text>
                  <TouchableOpacity style={styles.counterBtn} onPress={() => setHelpers(Math.min(3, helpers + 1))} disabled={helpers === 3}>
                    <PlusIc size={16} color={helpers === 3 ? theme.colors.text.muted : theme.colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backTextBtn} onPress={() => setStep('LOCATIONS')}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <GradientButton title="Get Fare Estimate →" onPress={calculateFare} variant="primary" />
                </View>
              </View>
            </>
          )}

          {/* ═══ STEP 3: Fare Estimate & Confirm ═══ */}
          {step === 'ESTIMATE' && fare && (
            <>
              <Text style={styles.stepTitle}>✅ Confirm Booking</Text>

              {/* Route Summary */}
              <View style={styles.routeCard}>
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: theme.colors.brand.primary }]} />
                  <View>
                    <Text style={styles.routeLabel}>PICKUP</Text>
                    <Text style={styles.routeAddr}>{pickup}</Text>
                  </View>
                </View>
                <View style={styles.routeDash} />
                <View style={styles.routeRow}>
                  <View style={[styles.routeDot, { backgroundColor: theme.colors.brand.secondary }]} />
                  <View>
                    <Text style={styles.routeLabel}>DROP-OFF</Text>
                    <Text style={styles.routeAddr}>{dropoff}</Text>
                  </View>
                </View>
              </View>

              {/* Booking Details Chips */}
              <View style={styles.detailChips}>
                <View style={styles.chip}>
                  <Text style={styles.chipIcon}>{vCfg.icon}</Text>
                  <Text style={styles.chipText}>{vCfg.label}</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipIcon}>{LOAD_CONFIG[loadType as keyof typeof LOAD_CONFIG].icon}</Text>
                  <Text style={styles.chipText}>{LOAD_CONFIG[loadType as keyof typeof LOAD_CONFIG].label}</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipIcon}>👷</Text>
                  <Text style={styles.chipText}>{helpers} helper{helpers !== 1 ? 's' : ''}</Text>
                </View>
              </View>

              {/* Fare Breakdown */}
              <View style={styles.fareCard}>
                <View style={styles.fareHeader}>
                  <RupeeIc size={16} color={theme.colors.text.primary} />
                  <Text style={styles.fareTitle}>Fare Breakdown</Text>
                </View>
                
                {[
                  { label: 'Base fare', value: fare.base },
                  { label: `Distance (${fare.distanceKm} km)`, value: fare.distanceCharge },
                  { label: 'Load surcharge', value: fare.loadSurcharge },
                  { label: `Helpers (${helpers})`, value: fare.helperCharge },
                  { label: 'Weight charge', value: fare.weightCharge },
                ].map(item => (
                  <View key={item.label} style={styles.fareRow}>
                    <Text style={styles.fareLabel}>{item.label}</Text>
                    <Text style={styles.fareValue}>{formatCurrency(item.value)}</Text>
                  </View>
                ))}

                <View style={styles.fareDivider} />
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>Subtotal</Text>
                  <Text style={styles.fareValueBold}>{formatCurrency(fare.subtotal)}</Text>
                </View>
                <View style={styles.fareRow}>
                  <Text style={styles.fareLabel}>GST (18%)</Text>
                  <Text style={styles.fareValue}>{formatCurrency(fare.gst)}</Text>
                </View>
                <View style={styles.fareDivider} />
                <View style={styles.fareRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(fare.total)}</Text>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backTextBtn} onPress={() => setStep('WEIGHT_VEHICLE')}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <GradientButton
                    title={`Confirm Booking — ${formatCurrency(fare.total)}`}
                    onPress={handleConfirmBooking}
                    variant="primary"
                    loading={bookingLoading}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  map: { flex: 1 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.secondary },

  // Header
  header: { position: 'absolute', top: 50, left: 16, right: 16, zIndex: 10, flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: theme.colors.background.card, justifyContent: 'center', alignItems: 'center', ...theme.shadows.sm },
  headerTitle: { color: theme.colors.text.primary, fontSize: 18, fontWeight: 'bold', marginLeft: 12, flex: 1 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: theme.colors.background.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border.subtle },
  stepDotActive: { backgroundColor: theme.colors.brand.primary, borderColor: theme.colors.brand.primary },
  stepNum: { fontSize: 11, fontWeight: 'bold', color: theme.colors.text.muted },
  stepLine: { width: 12, height: 2, backgroundColor: theme.colors.border.subtle, marginHorizontal: 2, borderRadius: 1 },
  stepLineActive: { backgroundColor: theme.colors.brand.primary },

  // Bottom Sheet
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', maxHeight: height * 0.65, backgroundColor: theme.colors.background.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, ...theme.shadows.card },
  bottomSheetContent: { padding: 20, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: theme.colors.border.subtle, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },

  // Step Titles
  stepTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 16 },

  // Step 1: Locations
  locationCard: { backgroundColor: theme.colors.background.tertiary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border.subtle },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  locationInput: { flex: 1 },
  locationLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.2, color: theme.colors.text.muted, marginBottom: 2 },
  input: { color: theme.colors.text.primary, fontSize: 16, paddingVertical: 8 },
  locationDivider: { marginLeft: 5, paddingVertical: 4 },
  dashedLine: { width: 2, height: 20, backgroundColor: theme.colors.border.subtle, marginLeft: 0, borderRadius: 1 },

  // Saved Addresses Quick Select
  savedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background.tertiary, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border.subtle },
  savedPillText: { fontSize: 12, fontWeight: '600', color: theme.colors.text.primary },

  // Step 2: Weight
  weightCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background.tertiary, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border.subtle },
  weightInput: { flex: 1, fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, marginLeft: 12, fontFamily: 'monospace' },
  weightUnit: { fontSize: 18, color: theme.colors.text.muted, fontWeight: '600' },
  suggestBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(55, 138, 221, 0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10, gap: 6 },
  suggestText: { color: theme.colors.brand.primary, fontSize: 13 },

  // Vehicles horizontal scroll
  vehicleScroll: { marginBottom: 4 },
  vehicleCard: { width: 130, backgroundColor: theme.colors.background.tertiary, borderRadius: 16, padding: 14, marginRight: 12, borderWidth: 2, borderColor: theme.colors.border.subtle, alignItems: 'center' },
  vehicleCardActive: { borderColor: theme.colors.brand.primary, backgroundColor: 'rgba(55, 138, 221, 0.08)' },
  vehicleCardDisabled: { opacity: 0.4 },
  vehicleIcon: { fontSize: 32, marginBottom: 8 },
  vehicleName: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text.primary, textAlign: 'center' },
  vehicleCap: { fontSize: 10, color: theme.colors.text.muted, marginTop: 2, textAlign: 'center' },
  vehiclePrice: { fontSize: 13, fontWeight: 'bold', color: theme.colors.brand.primary, marginTop: 6, fontFamily: 'monospace' },
  tooSmallText: { fontSize: 9, color: theme.colors.brand.danger, fontWeight: 'bold', marginTop: 2 },

  // Load Type Grid
  loadGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  loadPill: { width: (width - 64) / 3, backgroundColor: theme.colors.background.tertiary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border.subtle },
  loadPillActive: { borderColor: theme.colors.brand.primary, backgroundColor: 'rgba(55, 138, 221, 0.08)' },
  loadIcon: { fontSize: 24, marginBottom: 4 },
  loadLabel: { fontSize: 11, color: theme.colors.text.secondary, textAlign: 'center', fontWeight: '500' },
  surchargeText: { fontSize: 9, color: theme.colors.brand.primary, fontWeight: 'bold', marginTop: 2, fontFamily: 'monospace' },

  // Helpers
  helperCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.background.tertiary, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border.subtle },
  helperTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary },
  helperSubtitle: { fontSize: 12, color: theme.colors.text.muted, marginTop: 2 },
  helperCounter: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background.card, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border.subtle },
  counterBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  counterNum: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text.primary, marginHorizontal: 8, fontFamily: 'monospace' },

  // Buttons
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  backTextBtn: { paddingHorizontal: 16, paddingVertical: 14 },
  backBtnText: { color: theme.colors.text.muted, fontSize: 16, fontWeight: '600' },

  // Step 3: Route Summary
  routeCard: { backgroundColor: theme.colors.background.tertiary, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border.subtle },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.2, color: theme.colors.text.muted },
  routeAddr: { fontSize: 14, fontWeight: '600', color: theme.colors.text.primary, marginTop: 2 },
  routeDash: { width: 2, height: 20, backgroundColor: theme.colors.border.subtle, marginLeft: 5, marginVertical: 4 },

  // Detail Chips
  detailChips: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  chip: { flex: 1, backgroundColor: theme.colors.background.tertiary, borderRadius: 14, padding: 12, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: theme.colors.border.subtle },
  chipIcon: { fontSize: 24, marginBottom: 4 },
  chipText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.text.muted, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.5 },

  // Fare Breakdown
  fareCard: { backgroundColor: theme.colors.background.tertiary, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border.subtle },
  fareHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle },
  fareTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text.primary },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  fareLabel: { fontSize: 13, color: theme.colors.text.secondary },
  fareValue: { fontSize: 13, fontWeight: '500', color: theme.colors.text.primary, fontFamily: 'monospace' },
  fareValueBold: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text.primary, fontFamily: 'monospace' },
  fareDivider: { height: 1, backgroundColor: theme.colors.border.subtle, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: theme.colors.brand.primary, fontFamily: 'monospace' },

  // Searching
  searchingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13, 15, 26, 0.92)', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  pulseRing: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(55, 138, 221, 0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 28, borderWidth: 2, borderColor: 'rgba(55, 138, 221, 0.3)' },
  pulseInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(55, 138, 221, 0.2)', justifyContent: 'center', alignItems: 'center' },
  searchingText: { color: theme.colors.text.primary, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  searchingSubtext: { color: theme.colors.text.muted, fontSize: 14, marginBottom: 24 },
  cancelSearchBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.brand.danger },
  cancelText: { color: theme.colors.brand.danger, fontSize: 15, fontWeight: '600' },
});
