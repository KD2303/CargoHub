import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { CheckCircle, Download } from 'lucide-react-native';
import { GradientButton } from '../components/GradientButton';
import { StatusBar } from 'expo-status-bar';
import { api } from '../services/api';

const { width } = Dimensions.get('window');

export const CustomerPaymentScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Mocking the payment flow
  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate Razorpay sheet opening and succeeding after 2 seconds
    setTimeout(async () => {
      try {
        await api.post(`/bookings/${bookingId}/pay`, { amount: 650 }); // Mock call
      } catch (e) {
        console.log('Payment mock success anyway');
      }
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Auto navigate to rate driver
      setTimeout(() => {
        navigation.navigate('RateDriver', { bookingId });
      }, 1500);
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <StatusBar style="light" />
        <CheckCircle size={80} color={theme.colors.brand.secondary} style={styles.successIcon} />
        <Text style={styles.successText}>Payment Successful</Text>
        
        <TouchableOpacity style={styles.invoiceBtn}>
          <Download size={16} color={theme.colors.text.primary} />
          <Text style={styles.invoiceText}>Download GST Invoice</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Delivered!</Text>
        <Text style={styles.headerSub}>Please complete the payment.</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.routeRow}>
          <Text style={styles.routeLabel}>Route</Text>
          <Text style={styles.routeValue} numberOfLines={2}>Connaught Place → Cyber Hub</Text>
        </View>
        
        <View style={styles.routeRow}>
          <Text style={styles.routeLabel}>Cargo</Text>
          <View style={styles.cargoChip}>
            <Text style={styles.cargoChipText}>Small Box</Text>
          </View>
        </View>

        <View style={styles.routeRow}>
          <Text style={styles.routeLabel}>Distance</Text>
          <Text style={styles.routeValue}>15 km</Text>
        </View>
        
        <View style={styles.routeRow}>
          <Text style={styles.routeLabel}>Driver</Text>
          <Text style={styles.routeValue}>Rajesh Kumar</Text>
        </View>
      </View>

      <View style={styles.fareCard}>
        <Text style={styles.fareTitle}>Fare Breakdown</Text>
        
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Base Fare</Text>
          <Text style={styles.fareValue}>₹150</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Distance Charge (15 km)</Text>
          <Text style={styles.fareValue}>₹120</Text>
        </View>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Cargo Surcharge</Text>
          <Text style={styles.fareValue}>₹50</Text>
        </View>
        <View style={[styles.fareRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹320</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <GradientButton 
          title="Pay ₹320" 
          onPress={handlePayment} 
          loading={isProcessing} 
          variant="primary"
          style={styles.payBtn}
        />
        <Text style={styles.secureText}>🔒 Secure payment via Razorpay</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: 20,
    paddingTop: 60,
  },
  successContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successText: {
    color: theme.colors.text.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.full,
  },
  invoiceText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    color: theme.colors.brand.secondary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSub: {
    color: theme.colors.text.muted,
    fontSize: 16,
  },
  
  summaryCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.radius.lg,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  routeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  routeLabel: {
    color: theme.colors.text.muted,
    fontSize: 14,
  },
  routeValue: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  cargoChip: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  cargoChipText: {
    color: theme.colors.brand.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  fareCard: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.radius.md,
    padding: 20,
    marginBottom: 32,
  },
  fareTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  fareValue: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subtle,
  },
  totalLabel: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    color: theme.colors.brand.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  payBtn: {
    width: '100%',
    marginBottom: 16,
  },
  secureText: {
    color: theme.colors.text.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});
