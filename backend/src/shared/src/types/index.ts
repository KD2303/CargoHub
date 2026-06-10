// ============================================================================
// CargoHub — Shared Types
// Used by: backend, website, mobile
// ============================================================================

// ── Roles & Auth ────────────────────────────────────────────────────────────

export type Role = 'USER' | 'DRIVER' | 'ADMIN';
export type AccountType = 'STANDARD' | 'B2B';
export type KycStatus = 'UNSUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type Platform = 'android' | 'ios' | 'web';

export interface AuthUser {
  uid: string;
  email?: string;
  role: Role;
  accountType: AccountType;
  kycStatus?: KycStatus;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  firebaseUid: string;
  name: string;
  email?: string;
  phone: string;
  gender?: string;
  emailVerified?: boolean;
  profileCompleted?: boolean;
  fcmToken?: string;
  role: Role;
  accountType: AccountType;
  profilePhoto?: string;
  walletBalance?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Vehicles & Load ─────────────────────────────────────────────────────────

export type VehicleType = 'MINI_PICKUP' | 'TATA_ACE' | 'MINI_TRUCK' | 'LARGE_TRUCK' | 'TEMPO_407' | 'PICKUP_TRUCK';

export type LoadType =
  | 'FURNITURE'
  | 'APPLIANCES'
  | 'FRAGILE_GOODS'
  | 'BOXES_CARTONS'
  | 'BULK_GOODS'
  | 'ELECTRONICS';

// ── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DRIVER_ARRIVING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  driverId?: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropLat: number;
  dropLng: number;
  dropAddress: string;
  vehicleType: VehicleType;
  loadType: LoadType;
  helpersRequested: number;
  fareEstimate: number;
  finalFare?: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  driver?: DriverPublic;
  cargoPhotoUrl?: string;
  cancellationReason?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateInput {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropLat: number;
  dropLng: number;
  dropAddress: string;
  vehicleType: VehicleType;
  loadType: LoadType;
  helpersRequested: number;
  weight?: number;
  scheduledAt?: string;
}

// ── Driver ──────────────────────────────────────────────────────────────────

export interface DriverPublic {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  profilePhoto?: string;
  rating: number;
  totalTrips: number;
  currentLat?: number;
  currentLng?: number;
}

export interface DriverProfile extends DriverPublic {
  firebaseUid: string;
  email?: string;
  kycStatus: KycStatus;
  isAvailable: boolean;
  isActive: boolean;
  aadhaarUrl?: string;
  licenseUrl?: string;
  rcUrl?: string;
  vehiclePhotoUrl?: string;
  earnings: DriverEarnings;
  createdAt: string;
}

export interface DriverEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  tripCount: number;
}

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

// ── Fare ────────────────────────────────────────────────────────────────────

export interface FareEstimateInput {
  pickupLat: number;
  pickupLng: number;
  dropLat: number;
  dropLng: number;
  vehicleType: VehicleType;
  loadType: LoadType;
  helpersRequested: number;
  weight?: number;
  distanceKm?: number;
  surgeCondition?: string;
}

export interface FareBreakdown {
  base: number;
  distanceCharge: number;
  distanceKm: number;
  loadSurcharge: number;
  helperCharge: number;
  weightSurcharge?: number;
  weightCharge?: number;
  tollCharge?: number;
  surgeMultiplier: number;
  subtotal: number;
  gst: number;
  total: number;
}

// ── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ── Rating ───────────────────────────────────────────────────────────────────

export interface Rating {
  id: string;
  bookingId: string;
  userId: string;
  driverId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

// ── Admin ────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  adminUid: string;
  action: string;
  targetType: 'driver' | 'booking' | 'user';
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface KycDecision {
  decision: 'VERIFIED' | 'REJECTED';
  reason?: string;
}

export interface DriverSuspension {
  isActive: boolean;
  reason: string;
}

// ── Notifications ───────────────────────────────────────────────────────────

export interface NotificationPayload {
  title: string;
  body: string;
  data: Record<string, string>;
}

export interface NotificationTokens {
  fcmToken?: string;
  apnsToken?: string;
  oneSignalId?: string;
  platform: Platform;
}

// ── Socket.io Events ────────────────────────────────────────────────────────

export interface ServerToClientEvents {
  'booking:new': (booking: Booking) => void;
  'booking:accepted': (data: { driverId: string; driverName: string; eta: number }) => void;
  'driver:location': (location: DriverLocation) => void;
  'booking:status': (data: { bookingId: string; status: BookingStatus; timestamp: string }) => void;
  'booking:cancelled': (data: { bookingId: string; reason: string }) => void;
  'notification': (payload: NotificationPayload) => void;
}

export interface ClientToServerEvents {
  'join:booking': (data: { bookingId: string }) => void;
  'driver:location': (location: Omit<DriverLocation, 'driverId'> & { bookingId?: string }) => void;
  'booking:accept': (data: { bookingId: string }) => void;
  'booking:reject': (data: { bookingId: string }) => void;
  'booking:status': (data: { bookingId: string; status: BookingStatus }) => void;
}

// ── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── B2B ─────────────────────────────────────────────────────────────────────

export interface BulkBookingResult {
  created: number;
  failed: number;
  bookingIds: string[];
  errors: BulkBookingError[];
}

export interface BulkBookingError {
  row: number;
  field: string;
  message: string;
}

// ── Analytics ───────────────────────────────────────────────────────────────

export interface RevenueAnalytics {
  totalRevenue: number;
  daily: number;
  weekly: number;
  monthly: number;
  perVehicleType: Record<VehicleType, number>;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
}
