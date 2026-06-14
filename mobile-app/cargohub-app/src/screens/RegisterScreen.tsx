import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, Alert, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { theme } from '../theme/theme';
import { GradientButton } from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft as ArrowLeftIcon, Camera as CameraIcon } from 'lucide-react-native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { NativeModules } from 'react-native';

const isNativeGoogleAvailable = Platform.OS !== 'web' && !!NativeModules.RNGoogleSignin;
let GoogleSignin: any = null;

if (isNativeGoogleAvailable) {
  try {
    // @ts-ignore
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '1035293444458-oipqf2v9aeb5db422e1m7gntdhh9i4e1.apps.googleusercontent.com',
    });
  } catch (e) {
    console.warn('Google Sign-In module not found');
  }
}

const ArrowLeft = ArrowLeftIcon as any;
const Camera = CameraIcon as any;

export const RegisterScreen = ({ route, navigation }: any) => {
  const selectedRole = route.params?.role || 'USER';
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  
  // Driver specific fields
  const [vehicleNumber, setVehicleNumber] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password || !name || !phone) { 
      Alert.alert('Missing Fields', 'Please fill in all required fields.'); 
      return; 
    }
    
    if (selectedRole === 'DRIVER' && !vehicleNumber) {
      Alert.alert('Missing Fields', 'Please provide a vehicle number.');
      return;
    }
    
    setStep(2);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload an avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      let token;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        token = await userCredential.user.getIdToken();
      } catch (firebaseErr: any) {
        if (firebaseErr.code === 'auth/email-already-in-use') {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
            token = await userCredential.user.getIdToken();
          } catch (signInErr: any) {
            if (signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/wrong-password') {
              throw new Error('This email is already registered with a different password. Please use a different email to sign up, or log in with this email on the Login screen.');
            }
            throw signInErr;
          }
        } else {
          throw firebaseErr;
        }
      }
      
      let formattedPhone = phone.trim();
      if (formattedPhone && !formattedPhone.startsWith('+')) {
        formattedPhone = `+91${formattedPhone.replace(/^0+/, '')}`;
      }

      const endpoint = selectedRole === 'DRIVER' ? '/auth/register-driver' : '/auth/register-user';
      const payload: any = selectedRole === 'DRIVER' 
        ? { name, phone: formattedPhone, vehicleType: 'TATA_ACE', vehicleNumber: vehicleNumber || 'MH01AB1234' } 
        : { name, phone: formattedPhone };
      
      // In a real app we would upload the avatar to S3 or Firebase Storage here 
      // and append the avatarUrl to the payload.

      await api.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const tokenKey = selectedRole === 'DRIVER' ? '@cargohub_driver_token' : '@cargohub_customer_token';
      await AsyncStorage.setItem(tokenKey, token);

      await login(token);
    } catch (error: any) { 
      let errorMessage = error.message || 'Registration failed. Please try again.';
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      else if (error.response?.data?.errors) errorMessage = error.response.data.errors.map((e: any) => e.message).join('\n');
      
      Alert.alert('Sign Up Error', errorMessage); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogleLogin = async () => {
    if (!isNativeGoogleAvailable) {
      Alert.alert(
        'Expo Go Detected',
        'Google Sign-In requires native Android/iOS libraries that are not present in Expo Go. Please log in using Email/Password, or run "npm run dev:mobile:android" to compile the native app.'
      );
      return;
    }

    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;

      if (!idToken) throw new Error('No ID token found');

      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      const token = await userCredential.user.getIdToken();
      const googleName = userCredential.user.displayName || 'Google User';
      const googlePhone = userCredential.user.phoneNumber || '+910000000000';

      const endpoint = selectedRole === 'DRIVER' ? '/auth/register-driver' : '/auth/register-user';
      const payload = selectedRole === 'DRIVER' 
        ? { name: googleName, phone: googlePhone, vehicleType: 'TATA_ACE', vehicleNumber: 'MH01AB1234' } 
        : { name: googleName, phone: googlePhone };
        
      try {
        await api.post(endpoint, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (backendErr: any) {
        console.log("Backend sync status:", backendErr.response?.data || backendErr.message);
      }

      const tokenKey = selectedRole === 'DRIVER' ? '@cargohub_driver_token' : '@cargohub_customer_token';
      await AsyncStorage.setItem(tokenKey, token);
      await login(token);
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.message || 'Google Sign-In failed.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => {
          if (step === 2) setStep(1);
          else navigation.goBack();
        }}
      >
        <ArrowLeft size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>
        <Text style={styles.title}>CargoHub</Text>
        <Text style={styles.subtitle}>
          Create {selectedRole === 'DRIVER' ? 'Driver Partner' : 'Customer'} Account
        </Text>
      </View>

      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {step === 1 ? (
            <>
              <Text style={styles.welcomeTitle}>Sign Up</Text>
              <Text style={styles.label}>Fill in your details to continue</Text>
              
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" placeholderTextColor={theme.colors.text.muted} />
              </View>

              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone Number" placeholderTextColor={theme.colors.text.muted} />
              </View>

              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="Email Address" placeholderTextColor={theme.colors.text.muted} />
              </View>
              
              {selectedRole === 'DRIVER' && (
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} value={vehicleNumber} onChangeText={setVehicleNumber} autoCapitalize="characters" placeholder="Vehicle Number (e.g. MH01AB1234)" placeholderTextColor={theme.colors.text.muted} />
                </View>
              )}

              <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor={theme.colors.text.muted} />
              </View>

              <GradientButton title="Continue" onPress={handleNextStep} variant="coral" style={styles.button} />
              
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toggleContainer} onPress={() => navigation.navigate('Login', { role: selectedRole })}>
                <Text style={styles.toggleText}>Already have an account? Log In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.welcomeTitle}>Almost Done!</Text>
              <Text style={styles.label}>Add a profile picture (Optional)</Text>
              
              <View style={styles.avatarSection}>
                <TouchableOpacity style={styles.avatarUploadButton} onPress={handlePickAvatar}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Camera size={32} color={theme.colors.brand.primary} />
                      <Text style={styles.avatarPlaceholderText}>Upload Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <GradientButton title="Create Account" onPress={handleRegister} loading={loading} variant="coral" style={styles.button} />
            </>
          )}

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8 },
  header: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 20, paddingBottom: 20 },
  logoContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.brand.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden', ...theme.shadows.glow },
  title: { fontFamily: theme.typography.display.fontFamily, fontSize: 28, color: theme.colors.text.primary, fontWeight: 'bold' },
  subtitle: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 16, color: theme.colors.text.muted, marginTop: 4 },
  formContainer: { flex: 2, padding: theme.spacing.xl, paddingBottom: 50, backgroundColor: theme.colors.background.card, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, ...theme.shadows.card },
  welcomeTitle: { fontFamily: theme.typography.display.fontFamily, fontSize: 22, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 8 },
  label: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 14, color: theme.colors.text.secondary, marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border.subtle, borderRadius: theme.radius.md, backgroundColor: theme.colors.background.primary, overflow: 'hidden', marginBottom: 16 },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontFamily: theme.typography.body.fontFamily, fontSize: 16, color: theme.colors.text.primary },
  button: { marginTop: 8 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 9999,
    paddingVertical: 14,
    marginTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleG: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleContainer: { marginTop: 20, alignItems: 'center', paddingVertical: 10 },
  toggleText: { color: theme.colors.brand.primary, fontSize: 14, fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginVertical: 30 },
  avatarUploadButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.background.primary, borderWidth: 2, borderColor: theme.colors.border.subtle, borderStyle: 'dashed', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { color: theme.colors.brand.primary, fontSize: 12, marginTop: 8, fontWeight: 'bold' },
});
