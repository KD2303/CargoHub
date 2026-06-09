import { create } from 'zustand';

export interface LocationPoint {
  lng: number;
  lat: number;
  address?: string;
}

interface BookingState {
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
  setPickup: (loc: LocationPoint) => void;
  setDropoff: (loc: LocationPoint) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  pickup: { lng: 72.8777, lat: 19.0760, address: "Andheri East, Mumbai" }, // Default Mumbai
  dropoff: { lng: 73.8567, lat: 18.5204, address: "Thane West, Thane" }, // Default Thane
  setPickup: (loc) => set({ pickup: loc }),
  setDropoff: (loc) => set({ dropoff: loc }),
}));
