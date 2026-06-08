# FAR AWAY 2026 — Role-Based Access Control (RBAC) Addendum

> **Addendum to:** FAR_AWAY_2026_UPGRADED_MASTER.md + Cross-Platform Architecture Addendum
> **Scope:** Three roles (USER, DRIVER, ADMIN) + one extended role (B2B) across Android · iOS · Website

---

## Table of Contents

1. [Role Overview](#1-role-overview)
2. [Role Architecture & Hierarchy](#2-role-architecture--hierarchy)
3. [Platform Access Per Role](#3-platform-access-per-role)
4. [Session & Token Storage Per Platform](#4-session--token-storage-per-platform)
5. [Middleware Pipeline](#5-middleware-pipeline)
6. [Role Middleware — Code](#6-role-middleware--code)
7. [Permission Matrix — Full Table](#7-permission-matrix--full-table)
8. [Permissions by Category — Detailed Breakdown](#8-permissions-by-category--detailed-breakdown)
   - 8.1 Auth
   - 8.2 Bookings
   - 8.3 Fare
   - 8.4 Drivers
   - 8.5 Payments
   - 8.6 Ratings
   - 8.7 KYC & Media
   - 8.8 Invoices
   - 8.9 Analytics
   - 8.10 Notifications
   - 8.11 B2B (Extended USER)
9. [Socket.io Events — Role Mapping](#9-socketio-events--role-mapping)
10. [Supabase Row Level Security (RLS)](#10-supabase-row-level-security-rls)
11. [Firebase Auth — How One UID Works Across All Platforms](#11-firebase-auth--how-one-uid-works-across-all-platforms)
12. [Admin-Specific Restrictions](#12-admin-specific-restrictions)
13. [Driver KYC State Machine](#13-driver-kyc-state-machine)
14. [Booking Status — Who Can Transition What](#14-booking-status--who-can-transition-what)
15. [Push Notification Routing Per Role](#15-push-notification-routing-per-role)
16. [Security Rules Summary](#16-security-rules-summary)

---

## 1. Role Overview

FAR AWAY 2026 has **three primary roles** and **one extended role**. Every user in the system is assigned exactly one role stored in the `users.role` column in Supabase PostgreSQL. The role is verified on the backend from the Firebase ID token on every single request — the frontend is never trusted.

### USER
- **Who they are:** Customers who need cargo transported — individuals moving furniture, businesses sending parcels, families relocating.
- **Where they operate:** Android app, iOS app, and the website (booking portal).
- **What they do:** Create bookings, get fare estimates, track drivers in real-time, pay via Razorpay, download GST invoices, and rate drivers.
- **Access level:** Scoped entirely to their own data. A USER can never see another USER's bookings, payments, or profile.

### DRIVER
- **Who they are:** Verified transport operators who own or lease vehicles. Must pass KYC (Aadhaar + driving license + vehicle RC).
- **Where they operate:** Android app (primary), iOS app, and the website driver portal (for onboarding, earnings, and KYC upload).
- **What they do:** Toggle availability, receive incoming booking alerts, accept or reject jobs, update trip status in real-time, emit GPS location, and view their earnings.
- **Access level:** Scoped to their own profile and their assigned bookings only. A DRIVER cannot see other drivers' data or any user's private info beyond what's needed for the trip (pickup address, contact number).
- **Requirement:** Must have `kyc_status = VERIFIED` to go online and accept bookings.

### ADMIN
- **Who they are:** FAR AWAY platform operators. Accounts are seeded directly into the database — there is no self-registration path for ADMIN.
- **Where they operate:** Website only. Android and iOS access is intentionally blocked at the route guard level. There is no mobile admin panel.
- **What they do:** Approve or reject driver KYC, view and override all bookings, manage driver suspensions, view revenue analytics and booking heatmaps, manage B2B accounts.
- **Access level:** Full read/write on all data. Uses the Supabase `service_role` key on the backend (bypasses RLS). This key is never exposed to any client.

### B2B *(extends USER)*
- **Who they are:** Corporate clients — logistics companies, e-commerce businesses, hospitals — who need bulk or recurring cargo bookings.
- **Where they operate:** Website only (business dashboard). They have a USER account with an additional `account_type = B2B` flag.
- **What they do:** Everything a USER can do, plus: bulk booking via multi-row form or CSV upload, fleet invoice management, and consolidated GST reporting.
- **Access level:** Same as USER for individual bookings. Additional access to `/business/*` routes scoped to their company account.

---

## 2. Role Architecture & Hierarchy

```
                        FIREBASE AUTH
                        (single UID across all platforms)
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Backend verifies  │
                    │   Firebase token    │
                    │   → resolves role   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
           USER             DRIVER            ADMIN
        (customer)         (verified         (operator)
                            transport)
              │
              └── B2B (extends USER)
                  account_type = 'B2B'
```

### Role Assignment

| Role | How Assigned | Stored In |
|------|-------------|-----------|
| USER | Auto on `/auth/register-user` | `users.role = 'USER'` |
| DRIVER | Auto on `/auth/register-driver` | `users.role = 'DRIVER'` |
| ADMIN | Seeded by dev team directly in DB | `users.role = 'ADMIN'` |
| B2B | Admin upgrades USER account | `users.account_type = 'B2B'` |

### Role Enum in Codebase

```typescript
// shared/types/index.ts
export type Role = 'USER' | 'DRIVER' | 'ADMIN';
export type AccountType = 'STANDARD' | 'B2B';

export interface AuthUser {
  uid: string;           // Firebase UID — same across all platforms
  role: Role;
  accountType: AccountType;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'; // DRIVER only
  isActive: boolean;     // false = suspended
}
```

---

## 3. Platform Access Per Role

| Platform | USER | DRIVER | ADMIN | Notes |
|----------|------|--------|-------|-------|
| Android App | ✅ Full | ✅ Full | ❌ Blocked | Admin access blocked at route guard |
| iOS App | ✅ Full | ✅ Full | ❌ Blocked | Same — no mobile admin panel |
| Website (booking portal) | ✅ Full | ✅ Portal | ✅ Dashboard | Separate route groups per role |
| Website (driver portal) | ❌ | ✅ Full | ✅ View-only | Admins can view driver data |
| Website (admin panel) | ❌ | ❌ | ✅ Full | `/admin/*` routes — server-side role check |
| Website (B2B dashboard) | ✅ if B2B | ❌ | ✅ Manage | `/business/*` routes |
| Website (landing/marketing) | ✅ Public | ✅ Public | ✅ Public | No auth required |

### How Platform Blocking Works

The mobile apps do not have admin screens in the Expo Router file structure at all — the routes simply don't exist. On the backend, every admin route additionally checks `req.user.role === 'ADMIN'`, so even if someone reverse-engineers the app and hits the endpoint directly, the backend returns `403 Forbidden`.

```typescript
// Route guard example — admin panel
router.get('/admin/bookings',
  platformMiddleware,       // logs X-Platform header
  verifyFirebaseToken,      // 401 if invalid
  requireRole('ADMIN'),     // 403 if not admin
  adminController.listBookings
);
```

---

## 4. Session & Token Storage Per Platform

Firebase Auth generates a short-lived ID token (1 hour) and a long-lived refresh token. Each platform stores these differently based on security model.

| Platform | Role(s) | Token Storage | Why |
|----------|---------|---------------|-----|
| Android App | USER, DRIVER | `expo-secure-store` | Android Keystore hardware encryption |
| iOS App | USER, DRIVER | `expo-secure-store` | iOS Keychain encryption |
| Website — user/driver portal | USER, DRIVER | `httpOnly` cookie via next-auth | XSS-proof, SameSite=Strict, JS cannot read it |
| Website — admin panel | ADMIN | `httpOnly` cookie, verified server-side on every request | Zero token exposure to client JS |

### Token Refresh Flow

```typescript
// Mobile — Axios interceptor
api.interceptors.request.use(async (config) => {
  const currentUser = auth().currentUser;
  if (currentUser) {
    // getIdToken(true) forces a refresh if token is near expiry
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['X-Platform'] = Platform.OS; // 'android' | 'ios'
  }
  return config;
});

// Website — next-auth handles refresh transparently via session callbacks
// Admin panel — middleware re-verifies cookie on every server component render
```

---

## 5. Middleware Pipeline

Every single request — regardless of whether it comes from an Android driver, an iOS user, or a web admin — passes through this exact pipeline in order. The frontend is never trusted.

```
Request (Android | iOS | Web)
        │
        ▼
┌─────────────────────────────────┐
│  1. Platform Logger             │  Reads X-Platform header → PostHog analytics
│     (analytics only)            │  Never used for access decisions
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  2. Firebase Token Verification │  admin.auth().verifyIdToken(bearerToken)
│                                 │  → 401 if missing, invalid, or expired
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  3. Role Resolver               │  Looks up users table by firebaseUid
│                                 │  Attaches req.user = { uid, role, ... }
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  4. Route Guard (requireRole)   │  Checks req.user.role against allowed roles
│                                 │  → 403 if role is not permitted for this route
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  5. Ownership Validator         │  For driver/user-scoped routes:
│     (where applicable)          │  confirms req.user.uid matches the resource
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  6. Rate Limiter (Arcjet)       │  → 429 Too Many Requests if limit exceeded
│                                 │  Different limits per role (admin = higher)
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  7. Zod Input Validation        │  Schema-validated request body/params
│                                 │  → 400 Bad Request with field-level errors
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  8. Controller / Business Logic │  Actual handler runs
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  9. Response                    │  JSON + appropriate HTTP status
└─────────────────────────────────┘
```

---

## 6. Role Middleware — Code

### Core `requireRole` Middleware

```typescript
// middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role, isActive } = req.user;

    // Suspended accounts cannot do anything
    if (!isActive) {
      return res.status(403).json({
        error: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Contact support.',
      });
    }

    if (!roles.includes(role)) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Role '${role}' cannot access this resource.`,
        required: roles,
      });
    }

    next();
  };
};
```

### Ownership Validator (Prevents Cross-User Data Access)

```typescript
// middleware/ownership.middleware.ts
// Ensures a driver can only update THEIR assigned booking,
// a user can only cancel THEIR OWN booking, etc.

export const validateBookingOwnership = (role: 'user' | 'driver') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const booking = await bookingRepo.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'BOOKING_NOT_FOUND' });
    }

    const ownerField = role === 'user' ? 'user_id' : 'driver_id';

    if (booking[ownerField] !== req.user.uid) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not own this resource.',
      });
    }

    req.booking = booking; // attach for downstream use
    next();
  };
};
```

### KYC Guard (Driver-Specific)

```typescript
// middleware/kyc.middleware.ts
// Drivers must be KYC-verified before they can go online or accept bookings

export const requireVerifiedKyc = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.kycStatus !== 'VERIFIED') {
    return res.status(403).json({
      error: 'KYC_REQUIRED',
      message: 'Complete KYC verification before accepting bookings.',
      kycStatus: req.user.kycStatus,
    });
  }
  next();
};
```

### Route Definitions with Middleware Applied

```typescript
// routes/booking.routes.ts
import { requireRole, validateBookingOwnership, requireVerifiedKyc } from '../middleware';

// USER creates a booking
router.post('/bookings',
  requireRole('USER'),
  bookingController.create
);

// USER cancels their own booking
router.patch('/bookings/:id/cancel',
  requireRole('USER'),
  validateBookingOwnership('user'),
  bookingController.cancel
);

// DRIVER views their active booking
router.get('/bookings/driver/active',
  requireRole('DRIVER'),
  requireVerifiedKyc,
  bookingController.getDriverActive
);

// ADMIN views all bookings
router.get('/admin/bookings',
  requireRole('ADMIN'),
  adminController.listBookings
);

// ADMIN cancels any booking (override)
router.patch('/admin/bookings/:id/cancel',
  requireRole('ADMIN'),
  adminController.cancelBooking
);
```

---

## 7. Permission Matrix — Full Table

Legend: ✅ Allowed · ❌ Not allowed · ◈ B2B only (extends USER)

| Category | Permission / Action | USER | DRIVER | ADMIN | B2B |
|----------|--------------------:|:----:|:------:|:-----:|:---:|
| **Auth** | Register / login (phone OTP + Google) | ✅ | ✅ | ✅ | ✅ |
| **Auth** | Register push notification tokens | ✅ | ✅ | ❌ | ✅ |
| **Auth** | View own profile | ✅ | ✅ | ✅ | ✅ |
| **Bookings** | Create new booking | ✅ | ❌ | ❌ | ✅ |
| **Bookings** | View own booking history | ✅ | ❌ | ❌ | ✅ |
| **Bookings** | View single booking detail | ✅ | ✅ | ✅ | ✅ |
| **Bookings** | Cancel own booking | ✅ | ❌ | ❌ | ✅ |
| **Bookings** | Admin cancel / override any booking | ❌ | ❌ | ✅ | ❌ |
| **Bookings** | View active booking (driver-side) | ❌ | ✅ | ❌ | ❌ |
| **Bookings** | View all bookings with filters | ❌ | ❌ | ✅ | ❌ |
| **Fare** | Request fare estimate | ✅ | ❌ | ❌ | ✅ |
| **Drivers** | Find nearby drivers | ✅ | ❌ | ❌ | ✅ |
| **Drivers** | Toggle availability (online/offline) | ❌ | ✅ | ❌ | ❌ |
| **Drivers** | Update own GPS location | ❌ | ✅ | ❌ | ❌ |
| **Drivers** | Accept incoming booking | ❌ | ✅ | ❌ | ❌ |
| **Drivers** | Reject incoming booking | ❌ | ✅ | ❌ | ❌ |
| **Drivers** | Update booking status | ❌ | ✅ | ❌ | ❌ |
| **Drivers** | View own earnings | ❌ | ✅ | ❌ | ❌ |
| **Drivers** | View all drivers + KYC queue | ❌ | ❌ | ✅ | ❌ |
| **Drivers** | Approve / reject driver KYC | ❌ | ❌ | ✅ | ❌ |
| **Drivers** | Suspend / reinstate driver | ❌ | ❌ | ✅ | ❌ |
| **Payments** | Create Razorpay order | ✅ | ❌ | ❌ | ✅ |
| **Payments** | Verify payment signature | ✅ | ❌ | ❌ | ✅ |
| **Payments** | Razorpay webhook (server-to-server) | ❌ | ❌ | ❌ | ❌ |
| **Payments** | View revenue analytics | ❌ | ❌ | ✅ | ❌ |
| **Ratings** | Submit trip rating | ✅ | ❌ | ❌ | ✅ |
| **KYC / Media** | Upload KYC documents | ❌ | ✅ | ❌ | ❌ |
| **KYC / Media** | Upload cargo photo | ✅ | ✅ | ❌ | ✅ |
| **Invoices** | Download GST invoice | ✅ | ❌ | ✅ | ✅ |
| **Invoices** | Download all fleet invoices | ❌ | ❌ | ❌ | ◈ |
| **Analytics** | View booking heatmap | ❌ | ❌ | ✅ | ❌ |
| **Notifications** | Receive booking alerts | ❌ | ✅ | ❌ | ❌ |
| **Notifications** | Receive booking status updates | ✅ | ❌ | ❌ | ✅ |
| **B2B** | Bulk booking (CSV / multi-row) | ❌ | ❌ | ❌ | ◈ |
| **B2B** | Fleet invoice management | ❌ | ❌ | ❌ | ◈ |

---

## 8. Permissions by Category — Detailed Breakdown

---

### 8.1 Auth

#### Register / Login
- **Who:** USER, DRIVER, ADMIN (admin via seed only — no public registration path)
- **Endpoint:** `POST /auth/register-user` · `POST /auth/register-driver`
- **Flow:**
  1. Client calls Firebase Auth (phone OTP or Google)
  2. Firebase returns a UID + ID token
  3. Client sends ID token to backend
  4. Backend verifies token with Firebase Admin SDK
  5. Backend creates record in `users` table with `firebaseUid` and the appropriate `role`
- **Notes:** ADMIN accounts skip step 1–3. They are inserted directly with `INSERT INTO users (firebase_uid, role) VALUES (...)` by the dev team.

#### Register Push Notification Tokens
- **Who:** USER, DRIVER only
- **Endpoint:** `POST /auth/register-tokens`
- **Body:** `{ fcmToken?, apnsToken?, oneSignalId?, platform }`
- **Notes:** Called once on app launch / login. Admins use the web panel and don't need push tokens.

#### View Own Profile
- **Who:** USER, DRIVER, ADMIN
- **Endpoint:** `GET /auth/me`
- **Returns:** Profile scoped to the authenticated UID. All three roles can view their own info.

---

### 8.2 Bookings

#### Create New Booking
- **Who:** USER only
- **Endpoint:** `POST /bookings`
- **Why not DRIVER:** Drivers receive jobs — they never initiate them. This is a fundamental business rule, not a technical limitation.
- **Validation:** Pickup and drop coordinates must be in India (PostGIS check). Vehicle type and load type must be valid enums. At least one helper count is 0–3.
- **What happens after:** Backend runs PostGIS query to find the nearest available, verified driver. Sends Socket.io `booking:new` event to that driver.

#### View Own Booking History
- **Who:** USER only
- **Endpoint:** `GET /bookings`
- **Filtering:** Backend appends `WHERE user_id = req.user.uid` — users cannot see each other's bookings.
- **Pagination:** Supports `?page=&limit=&status=` query params.

#### View Single Booking Detail
- **Who:** USER (own bookings), DRIVER (assigned bookings), ADMIN (any booking)
- **Endpoint:** `GET /bookings/:id`
- **Access logic:**
  ```
  if role === ADMIN → return booking (no further check)
  if role === USER → check booking.user_id === req.user.uid → 403 if not
  if role === DRIVER → check booking.driver_id === req.user.uid → 403 if not
  ```
- **Includes:** Driver's current location (lat/lng from Redis cache), ETA, status history.

#### Cancel Booking
- **Who:** USER only (for own bookings)
- **Endpoint:** `PATCH /bookings/:id/cancel`
- **Rules:**
  - Cancellable states: `PENDING`, `ACCEPTED` (before DRIVER_ARRIVING)
  - After `DRIVER_ARRIVING`: cancellation fee applies (₹50 base)
  - After `PICKED_UP`: cannot cancel — must be flagged via support
- **Admin cancel:** `PATCH /admin/bookings/:id/cancel` — admin can cancel at any stage with a mandatory reason string.

#### View Active Booking (Driver)
- **Who:** DRIVER only
- **Endpoint:** `GET /bookings/driver/active`
- **Returns:** The single in-progress booking currently assigned to the authenticated driver. Returns `null` if no active booking.
- **Requires:** `kycStatus = VERIFIED`

#### View All Bookings (Admin)
- **Who:** ADMIN only
- **Endpoint:** `GET /admin/bookings`
- **Filters supported:** `status`, `driverId`, `userId`, `city`, `vehicleType`, `dateFrom`, `dateTo`, `page`, `limit`
- **Returns:** Full booking objects including user and driver details, payment status, fare breakdown.

---

### 8.3 Fare

#### Request Fare Estimate
- **Who:** USER, B2B (also publicly accessible — no auth required for estimate widget on landing page)
- **Endpoint:** `POST /fare/estimate`
- **Body:** `{ pickupLat, pickupLng, dropLat, dropLng, vehicleType, loadType, helpersRequested }`
- **Returns:** `FareBreakdown` — base fare, distance charge, load surcharge, helper charge, surge multiplier, subtotal, GST (18%), total
- **Notes:** The fare engine is also run client-side (shared `fareUtils.ts`) for an instant estimate before the API call returns. The API result is authoritative.

---

### 8.4 Drivers

#### Find Nearby Drivers
- **Who:** USER
- **Endpoint:** `GET /drivers/nearby?lat=&lng=&vehicleType=`
- **Returns:** Anonymised list (driver name, vehicle type, estimated distance, ETA). Does not return driver phone or personal info.
- **Source:** PostGIS query on driver location cache in Redis.

#### Toggle Availability
- **Who:** DRIVER only
- **Endpoint:** `PATCH /drivers/availability`
- **Body:** `{ available: boolean }`
- **Requirements:** Driver must have `kycStatus = VERIFIED` to set `available = true`.
- **Effect:** Updates `drivers.is_available` in Supabase. Updates Redis `driver:{id}:status` key.

#### Update GPS Location
- **Who:** DRIVER only
- **Primary:** Socket.io `driver:location` event (every 3 seconds during active trip)
- **Fallback:** `PATCH /drivers/location` REST endpoint (when Socket.io disconnects)
- **Body:** `{ lat, lng, heading, speed, bookingId }`
- **Storage:** Redis `driver:{id}:location` with 30-second TTL
- **Background (mobile):** Uses `expo-task-manager` + `expo-location` background task so location continues emitting even when the app is minimised on iOS/Android.

#### Accept / Reject Booking
- **Who:** DRIVER only
- **Events:** Socket.io `booking:accept` / `booking:reject`
- **Rules:**
  - 30-second window after receiving `booking:new`
  - If no response in 30 seconds → auto-rejected, backend tries the next nearest driver
  - After accepting, driver status changes to `on_trip` in Redis
  - Driver cannot accept another booking while on an active trip

#### Update Booking Status
- **Who:** DRIVER only
- **Event:** Socket.io `booking:status` with `{ bookingId, status }`
- **Valid transitions:** (see Section 14 for full state machine)
  - `ACCEPTED` → `DRIVER_ARRIVING`
  - `DRIVER_ARRIVING` → `PICKED_UP`
  - `PICKED_UP` → `IN_TRANSIT`
  - `IN_TRANSIT` → `DELIVERED`
- **Effect:** Updates `bookings.status` in Supabase, broadcasts to booking room.

#### View Own Earnings
- **Who:** DRIVER only
- **Endpoint:** `GET /drivers/:id/earnings`
- **Guard:** `:id` must match `req.user.uid` — drivers cannot view each other's earnings.
- **Returns:** `{ today: number, thisWeek: number, thisMonth: number, tripCount: number, breakdown: Trip[] }`

#### View All Drivers + KYC Queue (Admin)
- **Who:** ADMIN only
- **Endpoint:** `GET /admin/drivers`
- **Filters:** `kycStatus`, `isAvailable`, `vehicleType`, `city`
- **Returns:** Full driver profiles including documents, KYC status, trip count, rating.

#### Approve / Reject Driver KYC (Admin)
- **Who:** ADMIN only
- **Endpoint:** `PATCH /admin/drivers/:id/verify`
- **Body:** `{ decision: 'VERIFIED' | 'REJECTED', reason?: string }`
- **Effect:** Updates `drivers.kyc_status`. Sends email via Resend to the driver.

#### Suspend / Reinstate Driver (Admin)
- **Who:** ADMIN only
- **Endpoint:** `PATCH /admin/drivers/:id/status`
- **Body:** `{ isActive: boolean, reason: string }`
- **Effect:** Sets `users.is_active`. Suspended drivers are immediately blocked — their active Socket.io connection is terminated, they are marked offline in Redis, and subsequent token verifications fail with `403 ACCOUNT_SUSPENDED`.

---

### 8.5 Payments

#### Create Razorpay Order
- **Who:** USER only
- **Endpoint:** `POST /payments/create-order`
- **Trigger:** Called after booking status reaches `DELIVERED`
- **Returns:** `{ orderId, amount, currency }` — used by Razorpay client SDK to open the payment sheet
- **Amount source:** `bookings.final_fare` (set by backend after delivery, never by client)

#### Verify Payment Signature
- **Who:** USER only
- **Endpoint:** `POST /payments/verify`
- **Body:** `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
- **Process:** Backend verifies HMAC-SHA256 signature server-side using the Razorpay secret. If valid, updates `bookings.payment_status = 'PAID'` and emits Socket.io notification.
- **Critical:** Signature is NEVER verified client-side. The client only gets `payment_status` from the backend.

#### Razorpay Webhook
- **Who:** Razorpay servers only (not a user action)
- **Endpoint:** `POST /payments/webhook`
- **Auth:** Razorpay signature header (`x-razorpay-signature`) — verified with `crypto.timingSafeEqual`
- **Purpose:** Handles async events — `payment.captured`, `payment.failed`, refund events.
- **IP allowlist:** Optionally restrict to Razorpay's published IP ranges.

#### View Revenue Analytics (Admin)
- **Who:** ADMIN only
- **Endpoint:** `GET /admin/analytics/revenue`
- **Returns:** `{ totalRevenue, daily, weekly, monthly, perDriver, perCity, perVehicleType }`

---

### 8.6 Ratings

#### Submit Trip Rating
- **Who:** USER only
- **Endpoint:** `POST /ratings/:bookingId`
- **Body:** `{ rating: 1-5, comment?: string }`
- **Rules:**
  - Only one rating per completed booking
  - Can only rate after `payment_status = 'PAID'`
  - Cannot rate a cancelled booking
- **Effect:** Updates `drivers.rating` (rolling average). Stored in `ratings` table.

---

### 8.7 KYC & Media

#### Upload KYC Documents
- **Who:** DRIVER only
- **Endpoint:** `POST /drivers/kyc/upload` → Cloudinary → Supabase
- **Documents accepted:** Aadhaar card (front + back), driving license, vehicle registration certificate (RC), vehicle photo
- **Mobile:** Uses `expo-document-picker` for PDF/image selection and `expo-image-manipulator` for compression before upload
- **Web:** Uses `react-dropzone` for drag-and-drop or click upload
- **Effect:** Sets `drivers.kyc_status = 'PENDING'`. Adds driver to admin KYC review queue.

#### Upload Cargo Photo
- **Who:** USER (at pickup), DRIVER (at handoff for confirmation)
- **Endpoint:** `POST /bookings/:id/cargo-photo` → Cloudinary
- **Mobile:** Uses `expo-camera` for in-app capture
- **Purpose:** Proof of cargo condition. Stored against the booking. Used for dispute resolution.

---

### 8.8 Invoices

#### Download GST Invoice
- **Who:** USER (own bookings), ADMIN (any booking), B2B (own company bookings)
- **Endpoint:** `GET /api/invoice/:id`
- **Generation:** PDF rendered server-side using `@react-pdf/renderer` in a Next.js API route. Streamed as a download.
- **Contents:** Booking reference, pickup/drop addresses, vehicle type, fare breakdown, GST (18% IGST), driver details, company name/GSTIN for B2B.
- **Mobile:** Opens in-app PDF viewer via `expo-file-system` + `expo-sharing`.

#### Download All Fleet Invoices (B2B)
- **Who:** B2B accounts only
- **Endpoint:** `GET /business/invoices`
- **Returns:** Paginated list of all invoices scoped to the company account. Bulk download supported (ZIP via server).

---

### 8.9 Analytics

#### Booking Heatmap
- **Who:** ADMIN only
- **Endpoint:** `GET /admin/analytics/heatmap`
- **Returns:** GeoJSON — booking density data aggregated by city zone
- **Rendered with:** deck.gl HeatmapLayer on the admin dashboard map

---

### 8.10 Notifications

#### Driver Receives Booking Alert
- **Who:** DRIVER only
- **Channels:**
  - Socket.io event: `booking:new` (if driver is connected)
  - FCM push (if driver app is in background)
- **Payload:** `{ bookingId, pickup, drop, vehicleType, loadType, fareEstimate, timeoutSeconds: 30 }`
- **Mobile UX:** Full-screen incoming booking screen with countdown timer and Accept / Reject buttons. If in background, notification tray actions allow accepting without opening the app.

#### User Receives Status Updates
- **Who:** USER only
- **Channels:**
  - Socket.io events: `booking:accepted`, `booking:status`, `driver:location`, `booking:cancelled`
  - FCM (Android) / APNs via FCM (iOS) / OneSignal Web Push (website, Safari/Firefox)
- **Payload examples:**
  - Accepted: `{ driverName, driverPhone, vehicleNumber, eta }`
  - Location update: `{ lat, lng, heading, eta }` (every 3s, in-app only — not pushed)
  - Delivered: `{ finalFare, invoiceUrl }`

---

### 8.11 B2B (Extended USER)

B2B is not a separate role — it is a USER with `account_type = 'B2B'`. The backend checks both `role === 'USER'` and `accountType === 'B2B'` for B2B-specific routes.

#### Bulk Booking
- **Who:** B2B accounts only
- **Endpoint:** `POST /bookings/bulk`
- **Inputs:** Multi-row form on the web portal OR CSV upload (parsed server-side with Papa Parse)
- **CSV format:** `pickup_address, drop_address, vehicle_type, load_type, helpers, scheduled_time`
- **Returns:** `{ created: number, failed: number, bookingIds: string[], errors: RowError[] }`
- **Limit:** Max 50 bookings per bulk request

#### Fleet Invoice Management
- **Who:** B2B accounts only
- **Endpoint:** `GET /business/invoices`
- **Features:** Filter by date range, driver, city. Export as CSV or bulk download as ZIP.
- **Scoping:** All queries are filtered by `company_account_id` — a B2B account cannot see another company's invoices.

---

## 9. Socket.io Events — Role Mapping

All three platforms connect to the same Socket.io server. Role determines which events a client can emit and which it receives.

| Event | Direction | Who Can Emit | Who Receives | Description |
|-------|-----------|:------------:|:------------:|-------------|
| `join:booking` | Client → Server | USER, DRIVER | — | Join a booking room to receive real-time updates |
| `driver:location` | Client → Server | DRIVER | — | GPS coordinates emitted every 3 seconds during active trip |
| `booking:accept` | Client → Server | DRIVER | — | Accept an incoming booking |
| `booking:reject` | Client → Server | DRIVER | — | Reject an incoming booking |
| `booking:status` | Client → Server | DRIVER | — | Driver emits a status change |
| `booking:new` | Server → Client | — | DRIVER | New booking alert pushed to nearest driver |
| `booking:accepted` | Server → Client | — | USER | Booking accepted — includes driver info and ETA |
| `driver:location` | Server → Client | — | USER | Rebroadcast of driver GPS to the booking room |
| `booking:status` | Server → Client | — | USER, DRIVER | Status change broadcasted to all room members |
| `booking:cancelled` | Server → Client | — | USER, DRIVER | Cancellation notification with reason |
| `notification` | Server → Client | — | USER, DRIVER | General in-app notification payload |

### Socket.io Room Structure

```
booking:{bookingId}   ← USER and DRIVER joined here after booking is created
user:{userId}         ← USER's personal room (for notifications when not in a booking)
driver:{driverId}     ← DRIVER's personal room (for incoming booking alerts)
```

### Cross-Platform Socket.io Example

```
User books on WEBSITE
  → Backend: POST /bookings creates booking in Supabase
  → Backend: PostGIS finds nearest DRIVER (Android device)
  → Backend: socket.to('driver:{driverId}').emit('booking:new', bookingData)

DRIVER (Android) receives full-screen alert
  → Driver taps Accept
  → Android app: socket.emit('booking:accept', { bookingId })
  → Backend: UPDATE bookings SET status='ACCEPTED', driver_id=...
  → Backend: socket.to('booking:{bookingId}').emit('booking:accepted', { driverId, eta })

WEBSITE user receives confirmation
  → Shows "Driver on the way — 8 min"
  → Driver begins emitting GPS every 3s
  → Website map: truck marker moves in real-time
  → iOS user (same booking, different device): also receives location updates
    (both connected to same Socket.io room simultaneously ✅)
```

---

## 10. Supabase Row Level Security (RLS)

RLS is a defense-in-depth layer. The backend always uses the `service_role` key (bypasses RLS) for standard operations. RLS protects against:

- Direct Supabase SDK access (if ever accidentally exposed)
- Backend bugs that fail to scope queries correctly
- Future integrations that connect directly

```sql
-- ─── BOOKINGS ────────────────────────────────────────────────────

-- Users see only their own bookings
CREATE POLICY "user_own_bookings" ON bookings
  FOR SELECT USING (auth.uid()::text = user_id);

-- Drivers see only bookings assigned to them
CREATE POLICY "driver_assigned_bookings" ON bookings
  FOR SELECT USING (auth.uid()::text = driver_id);

-- Drivers can only update the status field (not fare, payment_status, etc.)
CREATE POLICY "driver_update_status" ON bookings
  FOR UPDATE USING (auth.uid()::text = driver_id)
  WITH CHECK (status IN (
    'ACCEPTED', 'DRIVER_ARRIVING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'
  ));

-- Only backend (service_role) can create bookings
-- This prevents any client from directly inserting a booking
-- No INSERT policy for users = INSERT is blocked for all non-service-role callers


-- ─── DRIVERS ─────────────────────────────────────────────────────

-- Drivers can update their own profile (availability, location)
CREATE POLICY "driver_update_own_profile" ON drivers
  FOR UPDATE USING (auth.uid()::text = firebase_uid);

-- Drivers can read their own full profile
CREATE POLICY "driver_read_own" ON drivers
  FOR SELECT USING (auth.uid()::text = firebase_uid);


-- ─── RATINGS ─────────────────────────────────────────────────────

-- Users can only submit one rating per booking
CREATE POLICY "user_rate_own_booking" ON ratings
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = ratings.booking_id
      AND bookings.user_id = auth.uid()::text
      AND bookings.payment_status = 'PAID'
    )
    AND NOT EXISTS (
      SELECT 1 FROM ratings r
      WHERE r.booking_id = ratings.booking_id
      AND r.user_id = auth.uid()::text
    )
  );
```

---

## 11. Firebase Auth — How One UID Works Across All Platforms

```
USER signs up on WEBSITE
  → Firebase: creates uid_abc123
  → Backend: INSERT INTO users (firebase_uid='uid_abc123', role='USER')
  → Stores session in httpOnly cookie

SAME USER opens ANDROID APP
  → Signs in with same phone number / Google account
  → Firebase returns SAME uid_abc123
  → App sends Firebase ID token to backend
  → Backend: SELECT * FROM users WHERE firebase_uid='uid_abc123'
  → Returns same user record — full booking history visible ✅

DRIVER signs up on iOS APP
  → Firebase: creates uid_drv456
  → Backend: INSERT INTO users (firebase_uid='uid_drv456', role='DRIVER')
  → Driver logs into web portal later
  → Firebase returns SAME uid_drv456 → same driver record ✅
```

### Token Verification (Identical for All Clients)

```typescript
// middleware/auth.middleware.ts
import { admin } from '../config/firebase';

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing Bearer token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // firebase-admin does not care which platform generated the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Look up the user in our DB to get role, isActive, etc.
    const user = await userRepo.findByFirebaseUid(decodedToken.uid);

    if (!user) {
      return res.status(401).json({ error: 'USER_NOT_FOUND' });
    }

    req.user = {
      uid: decodedToken.uid,
      role: user.role,
      accountType: user.accountType,
      kycStatus: user.kycStatus,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token is invalid or expired.' });
  }
};
```

---

## 12. Admin-Specific Restrictions

Admins have the highest privilege level, but with intentional constraints:

| Restriction | Details |
|-------------|---------|
| Web-only access | No admin routes exist in the Expo Router mobile app file structure. Backend additionally blocks with `requireRole('ADMIN')`. |
| No self-registration | ADMIN accounts cannot be created via `/auth/register-*`. They are seeded directly via SQL. |
| Audit logging | Every admin action is logged to an `audit_logs` table: `{ adminUid, action, targetId, targetType, timestamp, metadata }` |
| Cannot modify payment signatures | Razorpay signature verification uses a read-only Razorpay key. Admins cannot retroactively modify payment records. |
| Cannot impersonate users | There is no "login as user" feature. Admins can read user data but cannot act on behalf of a user. |
| Rate limits (higher than user) | Admin endpoints have a higher rate limit (1000 req/min vs 100 for USER) but are not exempt. |

### Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_uid   TEXT NOT NULL REFERENCES users(firebase_uid),
  action      TEXT NOT NULL,       -- 'KYC_APPROVED', 'DRIVER_SUSPENDED', 'BOOKING_CANCELLED', etc.
  target_type TEXT NOT NULL,       -- 'driver', 'booking', 'user'
  target_id   TEXT NOT NULL,       -- the affected record's ID
  metadata    JSONB,               -- { reason, previousValue, newValue }
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Example log entry:
-- { admin_uid: 'uid_admin1', action: 'KYC_REJECTED', target_type: 'driver',
--   target_id: 'drv_xyz', metadata: { reason: 'Aadhaar photo blurry, resubmit required' } }
```

---

## 13. Driver KYC State Machine

A driver cannot accept bookings until they reach `VERIFIED` status. Admins control this state.

```
        ┌─────────────────┐
        │   UNSUBMITTED   │  ← Driver registers but has not uploaded docs
        └────────┬────────┘
                 │  Driver uploads Aadhaar + License + RC + Vehicle photo
                 ▼
        ┌─────────────────┐
        │     PENDING     │  ← In admin review queue. Driver cannot go online.
        └────────┬────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   VERIFIED   │  │   REJECTED   │  ← Admin sends rejection with reason
│              │  │              │
│  Driver can  │  │  Driver must │
│  go online   │  │  resubmit    │
└──────────────┘  └──────┬───────┘
                         │  Driver resubmits corrected documents
                         ▼
                ┌─────────────────┐
                │     PENDING     │  ← Back to queue
                └─────────────────┘
```

**KYC Status Values:** `UNSUBMITTED` | `PENDING` | `VERIFIED` | `REJECTED`

---

## 14. Booking Status — Who Can Transition What

```
PENDING
  ├── DRIVER accepts → ACCEPTED          (DRIVER via Socket.io)
  └── USER cancels   → CANCELLED         (USER via REST)
  └── No driver found in 5 min → CANCELLED (Backend auto)

ACCEPTED
  ├── DRIVER departs → DRIVER_ARRIVING   (DRIVER via Socket.io)
  └── USER cancels   → CANCELLED         (USER via REST — cancellation fee applies)
  └── ADMIN cancels  → CANCELLED         (ADMIN via REST — any stage)

DRIVER_ARRIVING
  └── DRIVER picks up → PICKED_UP        (DRIVER via Socket.io)

PICKED_UP
  └── DRIVER departs with cargo → IN_TRANSIT  (DRIVER via Socket.io)

IN_TRANSIT
  └── DRIVER delivers → DELIVERED        (DRIVER via Socket.io)

DELIVERED
  └── USER pays → payment_status = PAID  (USER via REST — Razorpay)
  └── USER rates → rating submitted      (USER via REST)
```

| Status | Set By | Via | User Can Cancel? |
|--------|--------|-----|:----------------:|
| `PENDING` | Backend (auto after booking creation) | — | ✅ No fee |
| `ACCEPTED` | DRIVER | Socket.io `booking:accept` | ✅ ₹50 fee |
| `DRIVER_ARRIVING` | DRIVER | Socket.io `booking:status` | ✅ ₹50 fee |
| `PICKED_UP` | DRIVER | Socket.io `booking:status` | ❌ |
| `IN_TRANSIT` | DRIVER | Socket.io `booking:status` | ❌ |
| `DELIVERED` | DRIVER | Socket.io `booking:status` | ❌ |
| `CANCELLED` | USER / DRIVER / ADMIN / Backend | REST / Socket.io | — |

---

## 15. Push Notification Routing Per Role

One backend function, one call — handles all platforms and roles.

```typescript
// services/notification.service.ts

async function notifyUser(userId: string, payload: NotificationPayload) {
  const user = await getUserWithTokens(userId);
  const promises = [];

  // FCM — Android app + Android Chrome web push
  if (user.fcmToken) {
    promises.push(admin.messaging().send({
      token: user.fcmToken,
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
      android: { priority: 'high' },
    }));
  }

  // APNs via FCM — iOS app
  if (user.apnsToken) {
    promises.push(admin.messaging().send({
      token: user.apnsToken,
      notification: { title: payload.title, body: payload.body },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
        headers: { 'apns-priority': '10' },
      },
      data: payload.data,
    }));
  }

  // OneSignal — Website (Safari, Firefox users who can't receive FCM web push)
  if (user.oneSignalId) {
    promises.push(oneSignal.createNotification({
      include_player_ids: [user.oneSignalId],
      headings: { en: payload.title },
      contents: { en: payload.body },
      data: payload.data,
      url: `${process.env.WEBSITE_URL}/track/${payload.data.bookingId}`,
    }));
  }

  // In-app real-time (if the user has an active Socket.io connection)
  socketServer.to(`user:${userId}`).emit('notification', payload);

  // All push channels attempted in parallel — failure of one doesn't block others
  await Promise.allSettled(promises);
}

async function notifyDriver(driverId: string, payload: NotificationPayload) {
  const driver = await getDriverWithTokens(driverId);

  // Drivers use FCM for Android and APNs via FCM for iOS — same as user above
  // Drivers do not use OneSignal (no web push needed — they use the app)
  // ...same FCM + APNs + Socket.io pattern
}
```

### Which Notifications Each Role Receives

| Event | USER | DRIVER | ADMIN |
|-------|:----:|:------:|:-----:|
| Booking accepted by driver | ✅ | ❌ | ❌ |
| Driver location update | ✅ (in-app Socket.io only) | ❌ | ❌ |
| Booking delivered | ✅ | ❌ | ❌ |
| Payment received | ✅ | ✅ (payout triggered) | ❌ |
| New booking alert | ❌ | ✅ | ❌ |
| Booking auto-cancelled (no driver) | ✅ | ❌ | ❌ |
| KYC approved | ❌ | ✅ (email via Resend) | ❌ |
| KYC rejected | ❌ | ✅ (email with reason) | ❌ |
| High-value booking (>₹5000) | ❌ | ❌ | ✅ (optional — PostHog alert) |

---

## 16. Security Rules Summary

| Rule | Details |
|------|---------|
| All auth enforced server-side | Role is never trusted from the client. Always resolved from the Firebase UID → users table lookup. |
| No direct DB access from client | All three frontends call the backend API. No direct Supabase SDK calls from Android / iOS / Website. |
| Supabase RLS as defense-in-depth | Even if the backend is bypassed, RLS prevents cross-user data leaks. |
| Razorpay signature always server-side | Payment verification uses HMAC-SHA256 server-side. Never client-side. |
| Admin accounts cannot self-register | No public registration path for ADMIN role. SQL-seeded only. |
| Drivers require KYC before operating | `kycStatus = VERIFIED` checked by `requireVerifiedKyc` middleware on all driver-active endpoints. |
| Suspended accounts blocked immediately | `isActive = false` causes `403 ACCOUNT_SUSPENDED` at the token verification step — before any business logic runs. |
| Ownership validated on all resource endpoints | Users and drivers can only read/write their own records — validated via `validateBookingOwnership` middleware. |
| Admin actions are fully audited | Every admin mutation is logged to `audit_logs` with `{ adminUid, action, targetId, metadata, timestamp }`. |
| CORS allows mobile apps + whitelisted web origins | Mobile apps don't send `Origin` headers. Firebase token verification is the security layer, not CORS. |
| httpOnly cookies for web sessions | Web auth tokens are never accessible to browser JS. `SameSite=Strict` prevents CSRF. |
| Secrets never bundled in client builds | Razorpay secret, Supabase service_role key, Firebase Admin private key — all backend-only. Client only gets public/publishable keys. |

---

*FAR AWAY 2026 — RBAC Addendum*
*"Security lives in the backend. The frontend is a window, not a gatekeeper."*
