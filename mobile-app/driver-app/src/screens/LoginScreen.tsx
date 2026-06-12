import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, Alert, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { theme } from '../theme/theme';
import { GradientButton } from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { Truck as TruckIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-react-native';

const Truck = TruckIcon as any;
const ArrowLeft = ArrowLeftIcon as any;
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LoginScreen = ({ route, navigation }: any) => {
  const selectedRole = route.params?.role || 'USER';
  const { login } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password || (isSignUp && (!name || !phone))) { 
      Alert.alert('Missing Fields', 'Please fill in all required fields.'); 
      return; 
    }
    setLoading(true);
    try {
      if (isSignUp) {
        // Sign Up Flow
        let token;
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          token = await userCredential.user.getIdToken();
        } catch (firebaseErr: any) {
          if (firebaseErr.code === 'auth/email-already-in-use') {
            // They created the Firebase account but maybe the backend registration failed previously.
            // Let's log them in and try registering again.
            const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
            token = await userCredential.user.getIdToken();
          } else {
            throw firebaseErr;
          }
        }
        
        // Format phone number to ensure it has +91
        let formattedPhone = phone.trim();
        if (formattedPhone && !formattedPhone.startsWith('+')) {
          formattedPhone = `+91${formattedPhone.replace(/^0+/, '')}`;
        }

        // Register user in our backend
        const endpoint = selectedRole === 'DRIVER' ? '/auth/register-driver' : '/auth/register-user';
        const payload = selectedRole === 'DRIVER' 
          ? { name, phone: formattedPhone, vehicleType: 'TATA_ACE', vehicleNumber: 'MH01AB1234' } 
          : { name, phone: formattedPhone };
        
        await api.post(endpoint, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const tokenKey = selectedRole === 'DRIVER' ? '@cargohub_driver_token' : '@cargohub_customer_token';
        await AsyncStorage.setItem(tokenKey, token);

        await login(token);
      } else {
        // Login Flow
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const token = await userCredential.user.getIdToken();
        
        const tokenKey = selectedRole === 'DRIVER' ? '@cargohub_driver_token' : '@cargohub_customer_token';
        await AsyncStorage.setItem(tokenKey, token);

        try {
          await login(token);
        } catch (loginErr: any) {
          // If 401 USER_NOT_FOUND, it means Firebase has them but our DB doesn't.
          throw new Error('Profile not found. Please switch to Sign Up to complete your profile.');
        }
      }
    } catch (error: any) { 
      let errorMessage = error.message || 'Authentication failed. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors) {
        // Handle Zod validation arrays
        errorMessage = error.response.data.errors.map((e: any) => e.message).join('\n');
      }
      
      Alert.alert(isSignUp ? 'Sign Up Error' : 'Login Error', errorMessage); 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.png')} style={{ width: 44, height: 44 }} resizeMode="contain" />
        </View>
        <Text style={styles.title}>CargoHub</Text>
        <Text style={styles.subtitle}>
          {selectedRole === 'DRIVER' ? 'Driver Partner App' : 'Customer App'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.welcomeTitle}>
            {isSignUp ? 'Create an Account' : (selectedRole === 'DRIVER' ? 'Welcome Back, Driver 🚛' : 'Welcome Back 📦')}
          </Text>
          
          <Text style={styles.label}>{isSignUp ? 'Sign up to get started' : 'Sign in to your account'}</Text>
          
          {isSignUp && (
            <>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input} 
                  value={name} 
                  onChangeText={setName} 
                  placeholder="Full Name" 
                  placeholderTextColor={theme.colors.text.muted} 
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input} 
                  value={phone} 
                  onChangeText={setPhone} 
                  keyboardType="phone-pad"
                  placeholder="Phone Number (e.g. +919999988888)" 
                  placeholderTextColor={theme.colors.text.muted} 
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none"
              placeholder="Email Address" 
              placeholderTextColor={theme.colors.text.muted} 
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry
              placeholder="Password" 
              placeholderTextColor={theme.colors.text.muted} 
            />
          </View>

          <GradientButton 
            title={isSignUp ? 'Sign Up' : 'Sign In'} 
            onPress={handleAuth} 
            loading={loading} 
            disabled={!email || !password || (isSignUp && (!name || !phone))} 
            variant="primary"
            style={styles.button} 
          />

          <TouchableOpacity 
            style={styles.toggleContainer} 
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
          <Text style={styles.loadingText}>{isSignUp ? 'Creating Account...' : 'Verifying...'}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8 },
  header: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 20, paddingBottom: 20 },
  logoContainer: { width: 64, height: 64, borderRadius: theme.radius.xl, backgroundColor: theme.colors.brand.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...theme.shadows.glow },
  title: { fontFamily: theme.typography.display.fontFamily, fontSize: 28, color: theme.colors.text.primary, fontWeight: 'bold' },
  subtitle: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 16, color: theme.colors.text.muted, marginTop: 4 },
  formContainer: { flex: 2, padding: theme.spacing.xl, paddingBottom: 50, backgroundColor: theme.colors.background.card, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, ...theme.shadows.card },
  welcomeTitle: { fontFamily: theme.typography.display.fontFamily, fontSize: 22, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 8 },
  label: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 14, color: theme.colors.text.secondary, marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border.subtle, borderRadius: theme.radius.md, backgroundColor: theme.colors.background.primary, overflow: 'hidden', marginBottom: 16 },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontFamily: theme.typography.body.fontFamily, fontSize: 16, color: theme.colors.text.primary },
  button: { marginTop: 8 },
  toggleContainer: { marginTop: 20, alignItems: 'center', paddingVertical: 10 },
  toggleText: { color: theme.colors.brand.primary, fontSize: 14, fontWeight: '600' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13, 15, 26, 0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  loadingText: { marginTop: 12, color: theme.colors.text.primary, fontSize: 16, fontWeight: '600' },
});
