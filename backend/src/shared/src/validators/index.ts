// ============================================================================
// CargoHub — Zod Validators
// Shared validation schemas for backend + frontend
// ============================================================================

import { z } from 'zod';

// ── Enums ───────────────────────────────────────────────────────────────────

export const VehicleTypeSchema = z.enum(['TATA_ACE', 'TEMPO_407', 'PICKUP_TRUCK', 'LARGE_TRUCK']);
export const LoadTypeSchema = z.enum(['FURNITURE', 'APPLIANCES', 'FRAGILE_GOODS', 'BOXES_CARTONS', 'BULK_GOODS', 'ELECTRONICS']);
export const BookingStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'DRIVER_ARRIVING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']);
export const RoleSchema = z.enum(['USER', 'DRIVER', 'ADMIN']);

// ── Coordinates ─────────────────────────────────────────────────────────────

const latSchema = z.number().min(6.5).max(35.7);  // India latitude range
const lngSchema = z.number().min(68.1).max(97.4);  // India longitude range

// ── Auth ────────────────────────────────────────────────────────────────────

export const RegisterUserSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+91\d{10}$/, 'Must be a valid Indian phone number (+91XXXXXXXXXX)'),
  email: z.string().email().optional(),
  gender: z.string().optional(),
  profilePictureUrl: z.string().url().optional(),
});

export const RegisterDriverSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^\+91\d{10}$/, 'Must be a valid Indian phone number'),
  email: z.string().email().optional(),
  vehicleType: VehicleTypeSchema,
  vehicleNumber: z.string().regex(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/, 'Invalid vehicle registration number'),
});

export const RegisterTokensSchema = z.object({
  fcmToken: z.string().optional(),
  apnsToken: z.string().optional(),
  oneSignalId: z.string().optional(),
  platform: z.enum(['android', 'ios', 'web', 'web-onesignal']),
});

// ── Booking ─────────────────────────────────────────────────────────────────

export const CreateBookingSchema = z.object({
  pickupLat: latSchema,
  pickupLng: lngSchema,
  pickupAddress: z.string().min(5).max(500),
  dropLat: latSchema,
  dropLng: lngSchema,
  dropAddress: z.string().min(5).max(500),
  vehicleType: VehicleTypeSchema,
  loadType: LoadTypeSchema,
  helpersRequested: z.number().int().min(0).max(3),
  scheduledAt: z.string().datetime().optional(),
});

export const CancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ── Fare ────────────────────────────────────────────────────────────────────

export const FareEstimateSchema = z.object({
  pickupLat: latSchema,
  pickupLng: lngSchema,
  dropLat: latSchema,
  dropLng: lngSchema,
  vehicleType: VehicleTypeSchema,
  loadType: LoadTypeSchema,
  helpersRequested: z.number().int().min(0).max(3),
  weight: z.number().min(0).optional(),
});

// ── Driver ──────────────────────────────────────────────────────────────────

export const ToggleAvailabilitySchema = z.object({
  available: z.boolean(),
});

export const UpdateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
  bookingId: z.string().uuid().optional(),
});

// ── Payment ─────────────────────────────────────────────────────────────────

export const CreatePaymentOrderSchema = z.object({
  bookingId: z.string().uuid(),
});

export const VerifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// ── Rating ──────────────────────────────────────────────────────────────────

export const SubmitRatingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

// ── Admin ───────────────────────────────────────────────────────────────────

export const KycDecisionSchema = z.object({
  decision: z.enum(['VERIFIED', 'REJECTED']),
  reason: z.string().max(500).optional(),
});

export const DriverSuspensionSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().min(5).max(500),
});

export const AdminCancelBookingSchema = z.object({
  reason: z.string().min(5).max(500),
});

// ── B2B ─────────────────────────────────────────────────────────────────────

export const BulkBookingRowSchema = z.object({
  pickupAddress: z.string().min(5),
  dropAddress: z.string().min(5),
  vehicleType: VehicleTypeSchema,
  loadType: LoadTypeSchema,
  helpers: z.number().int().min(0).max(3).default(0),
  scheduledTime: z.string().datetime().optional(),
});

export const BulkBookingSchema = z.object({
  bookings: z.array(BulkBookingRowSchema).min(1).max(50),
});

// ── Query Params ────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const BookingFiltersSchema = PaginationSchema.extend({
  status: BookingStatusSchema.optional(),
  driverId: z.string().optional(),
  userId: z.string().optional(),
  city: z.string().optional(),
  vehicleType: VehicleTypeSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const DriverFiltersSchema = PaginationSchema.extend({
  kycStatus: z.enum(['UNSUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
  isAvailable: z.coerce.boolean().optional(),
  vehicleType: VehicleTypeSchema.optional(),
  city: z.string().optional(),
});

export const NearbyDriversSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  vehicleType: VehicleTypeSchema.optional(),
});
