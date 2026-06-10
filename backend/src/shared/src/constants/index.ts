// ============================================================================
// CargoHub — Constants & Configuration
// Shared across backend, website, and mobile
// ============================================================================

import type { VehicleType, LoadType, BookingStatus } from '../types';

// ── Vehicle Configuration ───────────────────────────────────────────────────

export const VEHICLE_CONFIG: Record<VehicleType, {
  label: string;
  description: string;
  capacity: string;
  baseFare: number;
  perKmRate: number;
  icon: string;
}> = {
  TATA_ACE: {
    label: 'Tata Ace',
    description: 'Mini truck for small loads',
    capacity: 'Up to 750 kg',
    baseFare: 100,
    perKmRate: 16,
    icon: '🛻',
  },
  TEMPO_407: {
    label: 'Tempo 407',
    description: 'Medium truck for furniture & appliances',
    capacity: 'Up to 2.5 tons',
    baseFare: 150,
    perKmRate: 22,
    icon: '🚛',
  },
  PICKUP_TRUCK: {
    label: 'Pickup Truck',
    description: 'Open-bed truck for bulk goods',
    capacity: 'Up to 1.5 tons',
    baseFare: 200,
    perKmRate: 18,
    icon: '🚚',
  },
  LARGE_TRUCK: {
    label: 'Large Truck',
    description: 'Heavy-duty for relocations & large cargo',
    capacity: 'Up to 7 tons',
    baseFare: 200,
    perKmRate: 28,
    icon: '🚛',
  },
  MINI_PICKUP: {
    label: 'Mini Pickup',
    description: 'Small delivery',
    capacity: 'Up to 300 kg',
    baseFare: 80,
    perKmRate: 12,
    icon: '🛻',
  },
  MINI_TRUCK: {
    label: 'Mini Truck',
    description: 'Medium truck',
    capacity: 'Up to 1.5 tons',
    baseFare: 180,
    perKmRate: 20,
    icon: '🚚',
  },
};

// ── Load Type Configuration ─────────────────────────────────────────────────

export const LOAD_CONFIG: Record<LoadType, {
  label: string;
  description: string;
  surchargePercent: number;
  icon: string;
}> = {
  FURNITURE: {
    label: 'Furniture',
    description: 'Tables, chairs, beds, sofas',
    surchargePercent: 10,
    icon: '🪑',
  },
  APPLIANCES: {
    label: 'Appliances',
    description: 'Washing machines, fridges, ACs',
    surchargePercent: 15,
    icon: '🧊',
  },
  FRAGILE_GOODS: {
    label: 'Fragile Goods',
    description: 'Glassware, artwork, delicate items',
    surchargePercent: 20,
    icon: '⚠️',
  },
  BOXES_CARTONS: {
    label: 'Boxes & Cartons',
    description: 'Packed boxes, general cargo',
    surchargePercent: 0,
    icon: '📦',
  },
  BULK_GOODS: {
    label: 'Bulk Goods',
    description: 'Raw materials, construction supplies',
    surchargePercent: 5,
    icon: '🏗️',
  },
  ELECTRONICS: {
    label: 'Electronics',
    description: 'Computers, TVs, sensitive equipment',
    surchargePercent: 20,
    icon: '💻',
  },
};

// ── Fare Constants ──────────────────────────────────────────────────────────

export const FARE_CONSTANTS = {
  HELPER_CHARGE_PER_PERSON: 150,  // ₹150 per helper
  MAX_HELPERS: 3,
  GST_RATE: 0.18,                 // 18% IGST
  CANCELLATION_FEE: 50,           // ₹50 base cancellation fee
  MIN_FARE: 100,                  // Minimum fare for any booking
  SURGE_THRESHOLDS: {
    LOW: 1.0,      // Normal
    MODERATE: 1.2,  // 20% surge
    HIGH: 1.5,     // 50% surge
    EXTREME: 2.0,  // 2x surge
  },
} as const;

// ── Booking Status Configuration ────────────────────────────────────────────

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, {
  label: string;
  description: string;
  color: string;
  step: number;
}> = {
  PENDING: {
    label: 'Pending',
    description: 'Looking for a driver...',
    color: '#F59E0B',
    step: 1,
  },
  ACCEPTED: {
    label: 'Accepted',
    description: 'Driver is preparing to pick up',
    color: '#3B82F6',
    step: 2,
  },
  DRIVER_ARRIVING: {
    label: 'Driver Arriving',
    description: 'Driver is on the way to pickup location',
    color: '#8B5CF6',
    step: 3,
  },
  PICKED_UP: {
    label: 'Picked Up',
    description: 'Cargo has been loaded',
    color: '#6366F1',
    step: 4,
  },
  IN_TRANSIT: {
    label: 'In Transit',
    description: 'Cargo is on the way to destination',
    color: '#0EA5E9',
    step: 5,
  },
  DELIVERED: {
    label: 'Delivered',
    description: 'Cargo has been delivered successfully',
    color: '#10B981',
    step: 6,
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'Booking has been cancelled',
    color: '#EF4444',
    step: -1,
  },
};

// ── Valid Booking Status Transitions ────────────────────────────────────────

export const VALID_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['DRIVER_ARRIVING', 'CANCELLED'],
  DRIVER_ARRIVING: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// ── Cancellable Statuses ────────────────────────────────────────────────────

export const USER_CANCELLABLE_STATUSES: BookingStatus[] = ['PENDING', 'ACCEPTED', 'DRIVER_ARRIVING'];
export const FEE_CANCELLATION_STATUSES: BookingStatus[] = ['ACCEPTED', 'DRIVER_ARRIVING'];

// ── Driver Search ───────────────────────────────────────────────────────────

export const DRIVER_SEARCH = {
  RADIUS_KM: 15,           // Search radius for nearby drivers
  MAX_RESULTS: 10,          // Max drivers to return
  BOOKING_TIMEOUT_S: 30,    // Seconds before auto-rejecting
  LOCATION_TTL_S: 30,       // Redis TTL for driver location
  STATUS_TTL_S: 60,         // Redis TTL for driver status
  GPS_INTERVAL_MS: 3000,    // GPS update interval during trip
} as const;

// ── Rate Limits ─────────────────────────────────────────────────────────────

export const RATE_LIMITS = {
  USER: { windowMs: 60_000, max: 100 },
  DRIVER: { windowMs: 60_000, max: 100 },
  ADMIN: { windowMs: 60_000, max: 1000 },
} as const;

// ── Pagination ──────────────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ── B2B ─────────────────────────────────────────────────────────────────────

export const B2B_LIMITS = {
  MAX_BULK_BOOKINGS: 50,
} as const;
