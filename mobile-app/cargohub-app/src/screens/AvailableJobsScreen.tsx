import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from 'react-native';
import MapViewOriginal, { Marker as MarkerOriginal, UrlTile as UrlTileOriginal } from 'react-native-maps';
import { theme } from '../theme/theme';
import { api } from '../services/api';
import { getMapTileUrl } from '../services/mapConfig';
import { useTheme } from '../context/ThemeContext';
import { AvailableJobCard } from '../components/AvailableJobCard';
import { IncomingJobModal } from './IncomingJobModal';
import { useSocket } from '../context/SocketContext';
import { useDriver } from '../context/DriverContext';
import { ArrowLeft as ArrowLeftIcon, Loader2 as Loader2Icon, MapPin as MapPinIcon } from 'lucide-react-native';

const MapView = MapViewOriginal as any;
const Marker = MarkerOriginal as any;
const UrlTile = UrlTileOriginal as any;
const ArrowLeft = ArrowLeftIcon as any;
const Loader2 = Loader2Icon as any;
const MapPin = MapPinIcon as any;

const { height } = Dimensions.get('window');

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

export const AvailableJobsScreen = ({ navigation }: any) => {
  const { themeMode } = useTheme();
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapTileUrl, setMapTileUrl] = useState('');

  useEffect(() => {
    setMapTileUrl(getMapTileUrl(themeMode));
  }, [themeMode]);
  const [incomingJob, setIncomingJob] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { socket } = useSocket();
  const { driver, setActiveBooking } = useDriver();

  const kycStatus = driver?.kycStatus || 'NOT_SUBMITTED';

  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/driver/available');
      if (res.data.success) {
        setAvailableJobs(res.data.data);
      }
    } catch (err) {
      console.log('Failed to fetch available jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewBooking = (booking: any) => {
        setAvailableJobs(prev => {
          if (!prev.find(b => b.id === booking.id)) {
            return [booking, ...prev];
          }
          return prev;
        });
      };
      
      const handleBookingAccepted = (data: { bookingId: string }) => {
        setAvailableJobs(prev => prev.filter(b => b.id !== data.bookingId));
      };

      socket.on('booking:new', handleNewBooking);
      socket.on('booking:accepted', handleBookingAccepted);
      return () => {
        socket.off('booking:new', handleNewBooking);
        socket.off('booking:accepted', handleBookingAccepted);
      };
    }
  }, [socket]);

  const handleAcceptJob = () => {
    if (socket && incomingJob) {
      socket.emit('booking:accept', { bookingId: incomingJob.id });
      setModalVisible(false);
      setActiveBooking(incomingJob);
      navigation.navigate('Job');
    }
  };

  const handleDeclineJob = () => {
    setModalVisible(false);
    setIncomingJob(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Jobs</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
           <Text style={styles.emptyText}>Loading available jobs...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              mapType={mapTileUrl ? 'none' : 'standard'}
              customMapStyle={mapTileUrl ? undefined : darkMapStyle}
              initialRegion={{
                latitude: availableJobs[0]?.pickupLat || 20.5937,
                longitude: availableJobs[0]?.pickupLng || 78.9629,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
            >
              {mapTileUrl ? (
                <UrlTile 
                  urlTemplate={mapTileUrl}
                  maximumZ={19}
                  shouldReplaceMapContent={true}
                />
              ) : null}
              {availableJobs.map(job => (
                job.pickupLat && job.pickupLng ? (
                  <Marker 
                    key={`marker-${job.id}`}
                    coordinate={{ latitude: job.pickupLat, longitude: job.pickupLng }}
                    title={job.pickupAddress}
                    description={`₹${job.fareEstimate} - ${job.loadType}`}
                    onCalloutPress={() => {
                      if (kycStatus !== 'VERIFIED') {
                        Alert.alert(
                          'KYC Required',
                          'You must verify your identity before you can accept jobs.',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Verify Now', onPress: () => navigation.navigate('KycUpload') }
                          ]
                        );
                        return;
                      }
                      setIncomingJob(job);
                      setModalVisible(true);
                    }}
                  >
                    <View style={[styles.marker, { backgroundColor: theme.colors.brand.primary }]}>
                      <MapPin size={12} color="white" />
                    </View>
                  </Marker>
                ) : null
              ))}
            </MapView>
          </View>
          
          {availableJobs.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>No available jobs right now.</Text>
              <Text style={styles.emptySubtext}>We'll notify you when a new booking is requested.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {availableJobs.map(job => (
                <AvailableJobCard 
                  key={job.id}
                  job={job} 
                  onPress={(j) => {
                    if (kycStatus !== 'VERIFIED') {
                      Alert.alert(
                        'KYC Required',
                        'You must verify your identity before you can accept jobs.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Verify Now', onPress: () => navigation.navigate('KycUpload') }
                        ]
                      );
                      return;
                    }
                    setIncomingJob(j);
                    setModalVisible(true);
                  }} 
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <IncomingJobModal 
        visible={modalVisible}
        job={incomingJob}
        onAccept={handleAcceptJob}
        onDecline={handleDeclineJob}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: theme.typography.display.fontFamily,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.35,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  map: {
    flex: 1,
  },
  marker: {
    padding: 6,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    ...theme.shadows.sm,
  },
  scrollContent: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontFamily: theme.typography.bodySemibold.fontFamily,
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: theme.typography.bodyMedium.fontFamily,
    fontSize: 14,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: 8,
  },
});
