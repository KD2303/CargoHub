import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { theme } from '../theme/theme';
import { Header } from '../components/Header';
import { GradientButton } from '../components/GradientButton';
import { StatusBadge } from '../components/StatusBadge';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, CircleCheck } from 'lucide-react-native';

type DocType = 'aadhaar' | 'license' | 'rc' | 'insurance' | 'photo';

export const KycUploadScreen = () => {
  const [documents, setDocuments] = useState<Record<DocType, string | null>>({ aadhaar: null, license: null, rc: null, insurance: null, photo: null });

  const pickImage = async (type: DocType) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return alert('Sorry, we need camera roll permissions to make this work!');
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setDocuments(prev => ({ ...prev, [type]: uri }));
    }
  };

  const allUploaded = Object.values(documents).every(doc => doc !== null);
  const handleSubmit = () => console.log('Submitting documents...', documents);

  const renderDocCard = (type: DocType, title: string, desc: string) => {
    const isUploaded = !!documents[type];
    return (
      <View style={styles.docCard} key={type}>
        <View style={styles.docInfo}><Text style={styles.docTitle}>{title}</Text><Text style={styles.docDesc}>{desc}</Text></View>
        {isUploaded ? (
          <TouchableOpacity onPress={() => pickImage(type)} style={styles.imagePreviewContainer}>
            <Image source={{ uri: documents[type]! }} style={styles.imagePreview} />
            <View style={styles.checkIcon}><CircleCheck size={16} color="white" /></View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(type)}>
            <Camera size={20} color={theme.colors.brand.primary} /><Text style={styles.uploadText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Driver KYC" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <StatusBadge status="pending" label="KYC Pending" />
          <Text style={styles.bannerText}>Please upload the following documents to verify your account and start accepting trips.</Text>
        </View>
        <View style={styles.list}>
          {renderDocCard('photo', 'Profile Photo', 'Clear photo of your face')}
          {renderDocCard('aadhaar', 'Aadhaar Card', 'Front and back merged')}
          {renderDocCard('license', 'Driving License', 'Valid commercial license')}
          {renderDocCard('rc', 'Vehicle RC', 'Registration certificate')}
          {renderDocCard('insurance', 'Vehicle Insurance', 'Valid insurance policy')}
        </View>
        <GradientButton title="Submit Documents" onPress={handleSubmit} disabled={!allUploaded} icon={<Upload size={20} color="white" />} style={styles.submitBtn} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  scrollContent: { padding: theme.spacing.lg },
  banner: { backgroundColor: theme.colors.background.card, padding: theme.spacing.lg, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.subtle, marginBottom: theme.spacing.xl },
  bannerText: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 14, color: theme.colors.text.secondary, marginTop: 12, lineHeight: 20 },
  list: { gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  docCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.background.card, padding: theme.spacing.md, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border.card },
  docInfo: { flex: 1, marginRight: theme.spacing.md },
  docTitle: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 15, color: theme.colors.text.primary },
  docDesc: { fontFamily: theme.typography.body.fontFamily, fontSize: 12, color: theme.colors.text.muted },
  uploadButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(2, 89, 221, 0.08)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.radius.full },
  uploadText: { fontFamily: theme.typography.bodySemibold.fontFamily, fontSize: 13, color: theme.colors.brand.primary },
  imagePreviewContainer: { position: 'relative' },
  imagePreview: { width: 60, height: 48, borderRadius: theme.radius.sm },
  checkIcon: { position: 'absolute', top: -6, right: -6, backgroundColor: theme.colors.brand.success, borderRadius: 10, borderWidth: 2, borderColor: 'white' },
  submitBtn: { marginBottom: 40 },
});
