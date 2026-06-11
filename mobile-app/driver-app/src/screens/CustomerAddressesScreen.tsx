import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { theme } from '../theme/theme';
import { MapPin as MapPinIcon, Home as HomeIcon, Briefcase as BriefcaseIcon, Plus as PlusIcon, Trash2 as Trash2Icon, ArrowLeft as ArrowLeftIcon } from 'lucide-react-native';

const MapPin = MapPinIcon as any;
const Home = HomeIcon as any;
const Briefcase = BriefcaseIcon as any;
const Plus = PlusIcon as any;
const Trash2 = Trash2Icon as any;
const ArrowLeft = ArrowLeftIcon as any;
import { StatusBar } from 'expo-status-bar';

// For this phase, we mock the addresses as if they are stored locally/in the API
const INITIAL_ADDRESSES = [
  { id: '1', type: 'HOME', label: 'Home', address: '123 Tech Park, Cyber City, Gurgaon', isDefault: true },
  { id: '2', type: 'WORK', label: 'Office', address: 'Building 14, DLF Phase 3, Gurgaon', isDefault: false },
];

export const CustomerAddressesScreen = ({ navigation }: any) => {
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState('OTHER');

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: () => setAddresses(prev => prev.filter(a => a.id !== id))
      }
    ]);
  };

  const handleSave = () => {
    if (!newLabel || !newAddress) {
      Alert.alert('Missing Info', 'Please enter both label and address.');
      return;
    }
    
    const newEntry = {
      id: Math.random().toString(),
      type: newType,
      label: newLabel,
      address: newAddress,
      isDefault: false
    };

    setAddresses([...addresses, newEntry]);
    setIsAdding(false);
    setNewLabel('');
    setNewAddress('');
    setNewType('OTHER');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'HOME': return <Home size={20} color={theme.colors.brand.primary} />;
      case 'WORK': return <Briefcase size={20} color={theme.colors.brand.secondary} />;
      default: return <MapPin size={20} color={theme.colors.text.muted} />;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.addressCard}>
      <View style={styles.iconContainer}>
        {getIcon(item.type)}
      </View>
      <View style={styles.addressInfo}>
        <View style={styles.labelRow}>
          <Text style={styles.addressLabel}>{item.label}</Text>
          {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
        </View>
        <Text style={styles.addressText}>{item.address}</Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Trash2 size={18} color={theme.colors.brand.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
      </View>

      {isAdding ? (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Add New Address</Text>
          
          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.typeSelector}>
            {['HOME', 'WORK', 'OTHER'].map(type => (
              <TouchableOpacity 
                key={type} 
                style={[styles.typePill, newType === type && styles.typePillActive]}
                onPress={() => setNewType(type)}
              >
                <Text style={[styles.typePillText, newType === type && styles.typePillTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Label (e.g. Mom's House)</Text>
          <TextInput 
            style={styles.input} 
            value={newLabel} 
            onChangeText={setNewLabel} 
            placeholder="Enter label" 
            placeholderTextColor={theme.colors.text.muted}
          />

          <Text style={styles.inputLabel}>Full Address</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={newAddress} 
            onChangeText={setNewAddress} 
            placeholder="Enter full address" 
            placeholderTextColor={theme.colors.text.muted}
            multiline
          />

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={addresses}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MapPin size={48} color={theme.colors.border.subtle} />
                <Text style={styles.emptyText}>No saved addresses yet</Text>
              </View>
            }
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.fab} onPress={() => setIsAdding(true)}>
              <Plus size={20} color="white" />
              <Text style={styles.fabText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background.card, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text.primary },

  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  addressCard: { backgroundColor: theme.colors.background.card, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border.subtle },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.background.tertiary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addressInfo: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  addressLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text.primary, marginRight: 8 },
  defaultBadge: { backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultText: { color: theme.colors.brand.secondary, fontSize: 10, fontWeight: 'bold' },
  addressText: { color: theme.colors.text.secondary, fontSize: 13 },
  deleteBtn: { padding: 8 },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: theme.colors.text.muted, marginTop: 16 },

  footer: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  fab: { backgroundColor: theme.colors.brand.primary, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', ...theme.shadows.glow },
  fabText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  // Add Form
  addForm: { paddingHorizontal: 20 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 24 },
  inputLabel: { color: theme.colors.text.secondary, fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: theme.colors.background.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: theme.colors.text.primary, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border.subtle },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  typeSelector: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  typePill: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.colors.background.card, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border.subtle },
  typePillActive: { backgroundColor: 'rgba(55, 138, 221, 0.1)', borderColor: theme.colors.brand.primary },
  typePillText: { color: theme.colors.text.muted, fontWeight: '600' },
  typePillTextActive: { color: theme.colors.brand.primary },

  formActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.background.card, borderWidth: 1, borderColor: theme.colors.border.subtle },
  cancelText: { color: theme.colors.text.primary, fontWeight: 'bold' },
  saveBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: theme.colors.brand.primary },
  saveText: { color: 'white', fontWeight: 'bold' },
});
