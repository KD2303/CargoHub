import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Vibration, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapViewOriginal, { Marker as MarkerOriginal, Polyline as PolylineOriginal, UrlTile as UrlTileOriginal } from 'react-native-maps';
const MapView = MapViewOriginal as any;
const Marker = MarkerOriginal as any;
const Polyline = PolylineOriginal as any;
const UrlTile = UrlTileOriginal as any;

import { theme } from '../theme/theme';
import { CountdownTimer } from '../components/CountdownTimer';
import { useTheme } from '../context/ThemeContext';
import { getMapTileUrl } from '../services/mapConfig';
import { MapPin as MapPinOriginal, Navigation as NavigationOriginal, Package, IndianRupee, Clock as ClockOriginal, ChevronDown } from 'lucide-react-native';
const MapPin = MapPinOriginal as any;
const Navigation = NavigationOriginal as any;
const Clock = ClockOriginal as any;

const { height, width } = Dimensions.get('window');

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

interface IncomingJobProps {
  visible: boolean;
  job: any;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingJobModal: React.FC<IncomingJobProps> = ({ visible, job, onAccept, onDecline }) => {
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const { themeMode } = useTheme();
  const [mapTileUrl, setMapTileUrl] = useState('');

  useEffect(() => {
    setMapTileUrl(getMapTileUrl(themeMode));
  }, [themeMode]);

  useEffect(() => {
    if (visible) {
      setExpired(false);
      setLoading(false);
      // Double pulse vibration for job requests
      Vibration.vibrate([0, 500, 200, 500], true);
    } else {
      Vibration.cancel();
    }
    return () => Vibration.cancel();
  }, [visible]);

  if (!job) return null;

  const handleTimeout = () => {
    setExpired(true);
    Vibration.cancel();
    setTimeout(() => {
      onDecline(); // Auto dismiss after 1.5s
    }, 1500);
  };

  const handleAcceptClick = () => {
    setLoading(true);
    setTimeout(() => {
      onAccept();
    }, 500); // simulate loading
  };

  const hasCoordinates = job.pickupLat && job.pickupLng && job.dropLat && job.dropLng;
  const olaMapsKey = (process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY || '').replace(/"/g, '');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Top - Countdown Section */}
          <View style={styles.timerSection}>
            <CountdownTimer duration={30} onComplete={handleTimeout} size={70} strokeWidth={5} />
            <Text style={[styles.timerLabel, expired && styles.expiredLabel]}>
              {expired ? 'Request Expired' : 'Respond before time runs out'}
            </Text>
          </View>

          {/* Middle - Map & Job Details Card */}
          <View style={styles.middleSection}>
            
            {/* Ola Map Overlay */}
            {hasCoordinates && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  mapType={mapTileUrl ? 'none' : 'standard'}
                  customMapStyle={mapTileUrl ? undefined : darkMapStyle}
                  initialRegion={{
                    latitude: (job.pickupLat + job.dropLat) / 2,
                    longitude: (job.pickupLng + job.dropLng) / 2,
                    latitudeDelta: Math.abs(job.pickupLat - job.dropLat) * 1.5 || 0.05,
                    longitudeDelta: Math.abs(job.pickupLng - job.dropLng) * 1.5 || 0.05,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  {/* Ola Maps Raster Tile Layer */}
                  {mapTileUrl ? (
                    <UrlTile 
                      urlTemplate={mapTileUrl}
                      maximumZ={19}
                      shouldReplaceMapContent={true}
                    />
                  ) : null}
                  <Polyline
                    coordinates={[
                      { latitude: job.pickupLat, longitude: job.pickupLng },
                      { latitude: job.dropLat, longitude: job.dropLng }
                    ]}
                    strokeColor={theme.colors.brand.primary}
                    strokeWidth={4}
                    lineDashPattern={[10, 8]}
                  />
                  <Marker coordinate={{ latitude: job.pickupLat, longitude: job.pickupLng }}>
                    <View style={styles.pickupMarker} />
                  </Marker>
                  <Marker coordinate={{ latitude: job.dropLat, longitude: job.dropLng }}>
                    <View style={styles.dropMarker} />
                  </Marker>
                </MapView>
              </View>
            )}

            {/* Job Details Content */}
            <View style={styles.detailsCard}>
              <View style={styles.routeContainer}>
                <View style={styles.routeItem}>
                  <MapPin size={20} color={theme.colors.brand.primary} />
                  <View style={styles.routeText}>
                    <Text style={styles.routeLabel}>Pickup</Text>
                    <Text style={styles.addressText} numberOfLines={1}>{job.pickupAddress}</Text>
                  </View>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routeItem}>
                  <Navigation size={20} color={theme.colors.brand.secondary} />
                  <View style={styles.routeText}>
                    <Text style={styles.routeLabel}>Drop</Text>
                    <Text style={styles.addressText} numberOfLines={1}>{job.dropAddress}</Text>
                  </View>
                </View>
              </View>

              {/* Chips */}
              <View style={styles.chipsRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>4.2 km</Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{job.loadType}</Text>
                </View>
                {job.helpersRequested > 0 && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>+Helper</Text>
                  </View>
                )}
              </View>

              {/* Fare & ETA */}
              <Text style={styles.fareDisplay}>₹{job.fareEstimate}</Text>
              <View style={styles.divider} />
              <View style={styles.etaContainer}>
                <Clock size={16} color={theme.colors.text.muted} />
                <Text style={styles.etaText}>~6 min to reach pickup</Text>
              </View>
            </View>
          </View>

          {/* Bottom - Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.acceptBtn, (expired || loading) && styles.disabledBtn]} 
              onPress={handleAcceptClick}
              disabled={expired || loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.acceptText}>✅ Accept Job</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.declineBtn, expired && styles.disabledBtn]} 
              onPress={onDecline}
              disabled={expired}
            >
              <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 15, 26, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingTop: theme.spacing.md,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
    maxHeight: height * 0.85,
    ...theme.shadows.glow,
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border.subtle,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    marginTop: 12,
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 13,
    color: theme.colors.text.muted,
  },
  expiredLabel: {
    color: theme.colors.brand.danger,
    fontWeight: 'bold',
  },
  middleSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 24,
  },
  mapContainer: {
    height: 140,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  map: {
    flex: 1,
    backgroundColor: theme.colors.background.card, // Fallback color
  },
  pickupMarker: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: theme.colors.brand.primary,
    borderWidth: 2, borderColor: 'white',
  },
  dropMarker: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: theme.colors.brand.secondary,
    borderWidth: 2, borderColor: 'white',
  },
  detailsCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeLine: {
    width: 2, height: 16,
    backgroundColor: theme.colors.border.subtle,
    marginLeft: 9, marginVertical: 4,
  },
  routeText: { flex: 1 },
  routeLabel: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 11, color: theme.colors.text.muted, textTransform: 'uppercase'
  },
  addressText: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 14, color: theme.colors.text.primary, marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 20,
  },
  chip: {
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: theme.radius.md,
    borderWidth: 1, borderColor: theme.colors.border.subtle,
  },
  chipText: {
    color: theme.colors.text.primary, fontSize: 12, fontWeight: '600'
  },
  fareDisplay: {
    fontFamily: theme.typography.display.fontFamily,
    fontSize: 36, fontWeight: 'bold', color: theme.colors.text.primary,
    textAlign: 'center', marginBottom: 16,
  },
  divider: {
    height: 1, backgroundColor: theme.colors.border.subtle, marginBottom: 12,
  },
  etaContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  etaText: {
    color: theme.colors.text.muted, fontSize: 13,
  },
  actionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: 12,
  },
  acceptBtn: {
    backgroundColor: theme.colors.brand.primary,
    paddingVertical: 16, borderRadius: theme.radius.full,
    alignItems: 'center', justifyContent: 'center',
    ...theme.shadows.sm,
  },
  acceptText: {
    color: 'white', fontSize: 16, fontWeight: 'bold',
  },
  declineBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 14, borderRadius: theme.radius.full,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: theme.colors.border.subtle,
  },
  declineText: {
    color: theme.colors.text.muted, fontSize: 15, fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
