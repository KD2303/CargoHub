import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TextInput, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { GradientButton } from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { Truck, ArrowLeft } from 'lucide-react-native';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const LoginScreen = ({ route, navigation }: any) => {
  const selectedRole = route.params?.role || 'USER';
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { 
      Alert.alert('Missing Fields', 'Please enter both email and password.'); 
      return; 
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      // Pass token to our AuthContext which verifies with backend
      await login(token);
    } catch (error: any) { 
      Alert.alert('Login Error', error.message || 'Failed to login. Please try again.'); 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Truck size={40} color="white" />
        </View>
        <Text style={styles.title}>CargoHub</Text>
        <Text style={styles.subtitle}>Customer App</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.welcomeTitle}>Welcome, Customer 👋</Text>
        
        <Text style={styles.label}>Sign in to your account</Text>
        
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
          title="Sign In" 
          onPress={handleLogin} 
          loading={loading} 
          disabled={!email || !password} 
          variant="coral"
          style={styles.button} 
        />
      </View>

      {/* Coral spinner overlay during verification/loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.brand.primary} />
          <Text style={styles.loadingText}>Verifying...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8 },
  header: { flex: 1.2, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  logoContainer: { width: 80, height: 80, borderRadius: theme.radius.xl, backgroundColor: theme.colors.brand.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16, ...theme.shadows.glow },
  title: { fontFamily: theme.typography.display.fontFamily, fontSize: 32, color: theme.colors.text.primary, fontWeight: 'bold' },
  subtitle: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 16, color: theme.colors.text.muted, marginTop: 4 },
  formContainer: { padding: theme.spacing.xl, paddingBottom: 50, backgroundColor: theme.colors.background.card, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, ...theme.shadows.card },
  welcomeTitle: { fontFamily: theme.typography.display.fontFamily, fontSize: 22, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 8 },
  label: { fontFamily: theme.typography.bodyMedium.fontFamily, fontSize: 14, color: theme.colors.text.secondary, marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border.subtle, borderRadius: theme.radius.md, backgroundColor: theme.colors.background.primary, overflow: 'hidden', marginBottom: 16 },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 16, fontFamily: theme.typography.body.fontFamily, fontSize: 16, color: theme.colors.text.primary },
  button: { marginTop: 8 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13, 15, 26, 0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  loadingText: { marginTop: 12, color: theme.colors.text.primary, fontSize: 16, fontWeight: '600' },
});
