import { create } from 'zustand';

export interface LocationPoint {
  lng: number;
  lat: number;
  address?: string;
}

interface FareData {
  base: number;
  distanceCharge: number;
  distanceKm: number;
  loadSurcharge: number;
  helperCharge: number;
  weightSurcharge: number;
  surgeMultiplier: number;
  subtotal: number;
  gst: number;
  total: number;
  durationMin?: number;
  monsoonSurchargeApplied?: boolean;
}

interface BookingState {
  pickup: LocationPoint | null;
  dropoff: LocationPoint | null;
  driverLocation: LocationPoint | null;
  vehicle: string;
  weight: string;
  cargoType: string;
  helpers: number;
  fareData: FareData | null;
  
  setPickup: (loc: LocationPoint | null) => void;
  setDropoff: (loc: LocationPoint | null) => void;
  setDriverLocation: (loc: LocationPoint | null) => void;
  setVehicle: (vehicle: string) => void;
  setWeight: (weight: string) => void;
  setCargoType: (type: string) => void;
  setHelpers: (h: number) => void;
  setFareData: (data: FareData | null) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  pickup: { lng: 72.8777, lat: 19.0760, address: "Andheri East, Mumbai" }, // Default Mumbai
  dropoff: { lng: 73.8567, lat: 18.5204, address: "Thane West, Thane" }, // Default Thane
  driverLocation: null,
  vehicle: "tempo",
  weight: "",
  cargoType: "Boxes & Cartons",
  helpers: 0,
  fareData: null,
  
  setPickup: (loc) => set({ pickup: loc }),
  setDropoff: (loc) => set({ dropoff: loc }),
  setDriverLocation: (loc) => set({ driverLocation: loc }),
  setVehicle: (v) => set({ vehicle: v }),
  setWeight: (w) => set({ weight: w }),
  setCargoType: (c) => set({ cargoType: c }),
  setHelpers: (h) => set({ helpers: h }),
  setFareData: (data) => set({ fareData: data }),
  
  resetBooking: () => set({ 
    pickup: null, 
    dropoff: null, 
    driverLocation: null,
    vehicle: "tempo", 
    weight: "", 
    cargoType: "Boxes & Cartons",
    helpers: 0,
    fareData: null 
  }),
}));
