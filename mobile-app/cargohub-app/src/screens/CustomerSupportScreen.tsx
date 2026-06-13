import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { theme } from '../theme/theme';
import { ArrowLeft as ArrowLeftIcon, Phone as PhoneIcon, Mail as MailIcon, FileText as FileTextIcon, ChevronRight as ChevronRightIcon, MessageSquare as MessageSquareIcon } from 'lucide-react-native';

const ArrowLeft = ArrowLeftIcon as any;
const Phone = PhoneIcon as any;
const Mail = MailIcon as any;
const FileText = FileTextIcon as any;
const ChevronRight = ChevronRightIcon as any;
const MessageSquare = MessageSquareIcon as any;
import { StatusBar } from 'expo-status-bar';

const FAQS = [
  { question: 'How do I track my driver?', answer: 'Once a driver is assigned, you can track them live on the map from your Active Trip screen.' },
  { question: 'What if my cargo is heavier than expected?', answer: 'The driver may ask to renegotiate the fare or cancel the trip if the vehicle capacity is exceeded. Please accurately estimate your weight.' },
  { question: 'How do helpers work?', answer: 'You can request up to 3 helpers during booking. They will assist with loading and unloading. A flat fee of ₹150 per helper applies.' },
];

export const CustomerSupportScreen = ({ navigation }: any) => {
  
  const handleCall = () => {
    Linking.openURL('tel:+9118001234567');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@cargohub.com');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support & Help</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact Cards */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={handleCall}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Phone size={24} color="#10B981" />
            </View>
            <Text style={styles.contactTitle}>Call Support</Text>
            <Text style={styles.contactSub}>24/7 Available</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(55, 138, 221, 0.1)' }]}>
              <Mail size={24} color={theme.colors.brand.primary} />
            </View>
            <Text style={styles.contactTitle}>Email Us</Text>
            <Text style={styles.contactSub}>Reply in 2 hrs</Text>
          </TouchableOpacity>
        </View>

        {/* Action List */}
        <View style={styles.actionList}>
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}><FileText size={20} color={theme.colors.text.primary} /></View>
            <Text style={styles.actionText}>Report an Issue with a Trip</Text>
            <ChevronRight size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}><MessageSquare size={20} color={theme.colors.text.primary} /></View>
            <Text style={styles.actionText}>Chat with Agent</Text>
            <ChevronRight size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {FAQS.map((faq, idx) => (
            <View key={idx} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
              {idx < FAQS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background.card, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text.primary },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 16, marginTop: 10 },
  
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  contactCard: { flex: 1, backgroundColor: theme.colors.background.card, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border.subtle },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  contactTitle: { color: theme.colors.text.primary, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  contactSub: { color: theme.colors.text.muted, fontSize: 12 },

  actionList: { backgroundColor: theme.colors.background.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border.subtle, marginBottom: 30 },
  actionItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  actionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.background.tertiary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  actionText: { flex: 1, color: theme.colors.text.primary, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: theme.colors.border.subtle, marginHorizontal: 16 },

  faqContainer: { backgroundColor: theme.colors.background.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border.subtle, paddingHorizontal: 16 },
  faqItem: { paddingVertical: 16 },
  faqQuestion: { color: theme.colors.text.primary, fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  faqAnswer: { color: theme.colors.text.secondary, fontSize: 14, lineHeight: 20 },
});
