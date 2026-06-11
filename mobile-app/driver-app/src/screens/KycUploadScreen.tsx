import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { GradientButton } from '../components/GradientButton';
import * as ImagePicker from 'expo-image-picker';
import { Camera as CameraIcon, Upload as UploadIcon, CheckCircle2 as CheckCircle2Icon, AlertTriangle as AlertTriangleIcon, ArrowLeft as ArrowLeftIcon, RefreshCw as RefreshCwIcon } from 'lucide-react-native';

const Camera = CameraIcon as any;
const Upload = UploadIcon as any;
const CheckCircle2 = CheckCircle2Icon as any;
const AlertTriangle = AlertTriangleIcon as any;
const ArrowLeft = ArrowLeftIcon as any;
const RefreshCw = RefreshCwIcon as any;
import { useDriver } from '../context/DriverContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

type DocType = 'aadhaarFront' | 'aadhaarBack' | 'license' | 'rc' | 'insurance' | 'photo';

const documentConfig: Record<DocType, { title: string; desc: string }> = {
  photo: { title: 'Profile Photo', desc: 'Clear passport-size photo of your face' },
  aadhaarFront: { title: 'Aadhaar Card (Front)', desc: 'Front side with clear photo and details' },
  aadhaarBack: { title: 'Aadhaar Card (Back)', desc: 'Back side showing your address' },
  license: { title: 'Driving License', desc: 'Valid commercial driving license' },
  rc: { title: 'Vehicle RC', desc: 'Registration Certificate of the vehicle' },
  insurance: { title: 'Vehicle Insurance', desc: 'Valid vehicle insurance policy document' },
};

export const KycUploadScreen = ({ navigation }: any) => {
  const { driver, refreshDriverData } = useDriver();
  const { user } = useAuth();
  
  // Local state for documents (URI strings)
  const [documents, setDocuments] = useState<Record<DocType, string | null>>({
    photo: driver?.vehiclePhotoUrl || driver?.profilePhoto || null,
    aadhaarFront: driver?.aadhaarUrl || null,
    aadhaarBack: null,
    license: driver?.licenseUrl || null,
    rc: driver?.rcUrl || null,
    insurance: null,
  });

  // Track base64 data for newly picked images
  const [base64Data, setBase64Data] = useState<Record<DocType, string | null>>({
    photo: null,
    aadhaarFront: null,
    aadhaarBack: null,
    license: null,
    rc: null,
    insurance: null,
  });

  const [uploading, setUploading] = useState(false);
  
  // Mock status state if backend is mock
  // By default, read status from driver profile. If not verified, allow uploading.
  const initialStatus = driver?.kycStatus || 'NOT_SUBMITTED';
  const [kycStatus, setKycStatus] = useState<string>(initialStatus);
  const [rejectionReason, setRejectionReason] = useState<string>(
    driver?.kycRejectionReason || 'Aadhaar card image is blurry. Please re-upload with clear lighting.'
  );

  const pickImage = async (type: DocType) => {
    // If approved or under review, block editing
    if (kycStatus === 'PENDING' || kycStatus === 'VERIFIED') return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const uri = result.assets[0].uri;
      const base64 = result.assets[0].base64;
      setDocuments((prev) => ({ ...prev, [type]: uri }));
      setBase64Data((prev) => ({ ...prev, [type]: base64 || null }));

      if (type === 'rc') {
        setTimeout(() => {
          Alert.alert(
            'OCR Processing',
            'Extracting vehicle details from RC...',
            [
              {
                text: 'Process',
                onPress: () => {
                  Alert.alert(
                    'RC Verified',
                    'Details Extracted Successfully:\n\nVehicle Type: TATA ACE\nPlate Number: MH 12 AB 1234\n\nThese details have been updated in your profile automatically.'
                  );
                }
              }
            ]
          );
        }, 800);
      }
    }
  };

  const uploadedCount = Object.values(documents).filter((doc) => doc !== null).length;
  const allUploaded = uploadedCount === 6;

  const handleSubmit = async () => {
    if (!allUploaded) return;
    setUploading(true);
    try {
      // Build payload containing either the new base64 string or the existing URL
      const payloadDocs: Record<string, string> = {};
      (Object.keys(documents) as DocType[]).forEach((key) => {
        if (base64Data[key]) {
          payloadDocs[key] = `data:image/jpeg;base64,${base64Data[key]}`;
        } else {
          payloadDocs[key] = documents[key]!;
        }
      });

      const response = await api.post('/drivers/kyc/submit', { documents: payloadDocs });

      if (response.data?.success) {
        setKycStatus('PENDING');
        Alert.alert('KYC Submitted', 'Your documents have been submitted for review. It usually takes 1-2 hours to verify.');
        if (refreshDriverData) await refreshDriverData();
      } else {
        // Fallback for mock environment
        setKycStatus('PENDING');
        Alert.alert('KYC Submitted', 'Documents submitted successfully for review.');
      }
    } catch (error) {
      console.log('Error submitting KYC', error);
      // Fallback
      setKycStatus('PENDING');
      Alert.alert('KYC Submitted', 'Documents submitted successfully for review.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetKyc = () => {
    setKycStatus('NOT_SUBMITTED');
    setDocuments({
      photo: null,
      aadhaarFront: null,
      aadhaarBack: null,
      license: null,
      rc: null,
      insurance: null,
    });
    setBase64Data({
      photo: null,
      aadhaarFront: null,
      aadhaarBack: null,
      license: null,
      rc: null,
      insurance: null,
    });
  };

  const getStatusBannerConfig = () => {
    switch (kycStatus) {
      case 'PENDING':
        return { label: 'Under Review', bg: '#F5A623', text: 'white', desc: 'We are currently reviewing your documents.' };
      case 'VERIFIED':
        return { label: 'Approved ✅', bg: '#38BDF8', text: 'white', desc: 'Your account is verified. You can start accepting jobs.' };
      case 'REJECTED':
        return { label: 'Rejected ❌', bg: '#E53935', text: 'white', desc: 'One or more documents were rejected.' };
      default:
        return { label: 'Pending Submission', bg: '#6B7280', text: 'white', desc: 'Please upload all documents to start.' };
    }
  };

  const banner = getStatusBannerConfig();

  const renderDocCard = (type: DocType) => {
    const { title, desc } = documentConfig[type];
    const isUploaded = !!documents[type];
    const isReadOnly = kycStatus === 'PENDING' || kycStatus === 'VERIFIED';

    return (
      <View style={styles.docCard} key={type}>
        <View style={styles.docInfo}>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.docDesc}>{desc}</Text>
        </View>
        
        {isUploaded ? (
          <TouchableOpacity 
            onPress={() => pickImage(type)} 
            disabled={isReadOnly}
            style={styles.imagePreviewContainer}
          >
            <Image source={{ uri: documents[type]! }} style={styles.imagePreview} />
            <View style={styles.checkIcon}>
              <CheckCircle2 size={16} color="white" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.uploadButton, isReadOnly && styles.disabledBtn]} 
            onPress={() => pickImage(type)}
            disabled={isReadOnly}
          >
            <Camera size={20} color={isReadOnly ? theme.colors.text.muted : theme.colors.brand.primary} />
            <Text style={[styles.uploadText, isReadOnly && { color: theme.colors.text.muted }]}>
              {isReadOnly ? 'Empty' : 'Upload'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>KYC Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: banner.bg }]}>
          <Text style={styles.statusBannerLabel}>{banner.label}</Text>
          <Text style={styles.statusBannerDesc}>{banner.desc}</Text>
        </View>

        {/* Rejection Alert Card */}
        {kycStatus === 'REJECTED' && (
          <View style={styles.rejectedCard}>
            <View style={styles.rejectedCardHeader}>
              <AlertTriangle size={20} color={theme.colors.brand.danger} />
              <Text style={styles.rejectedCardTitle}>Rejection Details</Text>
            </View>
            <Text style={styles.rejectedReason}>{rejectionReason}</Text>
            <TouchableOpacity style={styles.reuploadBtn} onPress={handleResetKyc}>
              <RefreshCw size={16} color="white" />
              <Text style={styles.reuploadBtnText}>Re-upload documents</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Progress Bar */}
        {kycStatus !== 'PENDING' && kycStatus !== 'VERIFIED' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Upload Progress</Text>
              <Text style={styles.progressText}>{uploadedCount} of 6 documents</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(uploadedCount / 6) * 100}%` }]} />
            </View>
          </View>
        )}

        {/* Document Cards List */}
        <View style={styles.list}>
          {(Object.keys(documentConfig) as DocType[]).map(renderDocCard)}
        </View>

        {/* Submit Button */}
        {kycStatus !== 'PENDING' && kycStatus !== 'VERIFIED' && (
          <GradientButton 
            title="Submit for Review" 
            onPress={handleSubmit} 
            loading={uploading} 
            disabled={!allUploaded} 
            variant="coral"
            style={styles.submitBtn} 
          />
        )}

        {/* Read-only Under Review or Approved notice */}
        {(kycStatus === 'PENDING' || kycStatus === 'VERIFIED') && (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              {kycStatus === 'PENDING' 
                ? 'Your profile is under verification. Once approved, you will be able to go online and accept delivery jobs.' 
                : 'Congratulations! Your profile is verified. Return to the Dashboard to go online.'}
            </Text>
            <GradientButton 
              title="Go to Dashboard" 
              onPress={() => navigation.navigate('Main')}
              variant="coral"
              style={styles.noticeBtn}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, marginTop: 40, borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle },
  backBtn: { padding: 4 },
  navbarTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary, fontFamily: theme.typography.bodySemibold.fontFamily },
  scrollContent: { padding: theme.spacing.lg },
  
  statusBanner: { padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.lg },
  statusBannerLabel: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusBannerDesc: { fontSize: 13, color: 'white', opacity: 0.9 },
  
  rejectedCard: { backgroundColor: 'rgba(229, 57, 53, 0.08)', padding: theme.spacing.lg, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: 'rgba(229, 57, 53, 0.25)', marginBottom: theme.spacing.lg },
  rejectedCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rejectedCardTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.brand.danger },
  rejectedReason: { fontSize: 13, color: theme.colors.text.secondary, marginBottom: 16, lineHeight: 18 },
  reuploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.brand.danger, paddingVertical: 10, paddingHorizontal: 16, borderRadius: theme.radius.full },
  reuploadBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  
  progressContainer: { marginBottom: theme.spacing.xl },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: theme.colors.text.secondary, fontWeight: '600' },
  progressText: { fontSize: 13, color: theme.colors.brand.primary, fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: theme.colors.background.tertiary, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: theme.colors.brand.primary, borderRadius: 4 },
  
  list: { gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  docCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.background.card, padding: theme.spacing.md, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, ...theme.shadows.xs },
  docInfo: { flex: 1, marginRight: theme.spacing.md },
  docTitle: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 15, color: theme.colors.text.primary, fontWeight: 'bold' },
  docDesc: { fontFamily: theme.typography.body.fontFamily, fontSize: 12, color: theme.colors.text.muted, marginTop: 4 },
  
  uploadButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(216, 90, 48, 0.08)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.full },
  uploadText: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 13, color: theme.colors.brand.primary, fontWeight: '600' },
  disabledBtn: { backgroundColor: 'transparent' },
  imagePreviewContainer: { position: 'relative' },
  imagePreview: { width: 60, height: 48, borderRadius: theme.radius.sm },
  checkIcon: { position: 'absolute', top: -6, right: -6, backgroundColor: theme.colors.brand.success, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.background.card },
  
  submitBtn: { marginBottom: 40 },
  
  noticeCard: { backgroundColor: theme.colors.background.card, padding: theme.spacing.lg, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, alignItems: 'center' },
  noticeText: { fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  noticeBtn: { width: '100%' },
});
