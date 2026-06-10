import { create } from 'zustand';

export interface SavedAddress {
  id: string;
  title: string;
  type: string; // 'Home', 'Office', 'Warehouse', 'Other'
  address: string;
  city: string;
  state: string;
  pin: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

interface AddressState {
  addresses: SavedAddress[];
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  updateAddress: (id: string, address: Omit<SavedAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  addresses: [], // Start with an empty list instead of dummy data
  
  addAddress: (newAddr) => set((state) => {
    const id = Date.now().toString();
    const isFirst = state.addresses.length === 0;
    
    // If it's the first address, or if new address is set as default, we need to update others
    let updatedAddresses = [...state.addresses];
    
    if (newAddr.isDefault || isFirst) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    
    return {
      addresses: [...updatedAddresses, { ...newAddr, id, isDefault: newAddr.isDefault || isFirst }]
    };
  }),
  
  updateAddress: (id, updatedAddr) => set((state) => {
    let updatedAddresses = state.addresses.map(a => 
      a.id === id ? { ...updatedAddr, id } : a
    );
    
    // If the updated address is set to default, unset others
    if (updatedAddr.isDefault) {
      updatedAddresses = updatedAddresses.map(a => 
        a.id === id ? a : { ...a, isDefault: false }
      );
    }
    
    return { addresses: updatedAddresses };
  }),
  
  removeAddress: (id) => set((state) => {
    const filtered = state.addresses.filter(a => a.id !== id);
    // If we removed the default address, make the first remaining one default
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    return { addresses: filtered };
  }),
  
  setDefaultAddress: (id) => set((state) => ({
    addresses: state.addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }))
  }))
}));
