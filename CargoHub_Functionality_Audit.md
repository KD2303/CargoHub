# CargoHub — Website Functionality Audit
> Cross-referenced against `README.md` RBAC Addendum · Audited: 2026-06-10

---

## Legend
- 🔴 **Critical** — Feature is completely non-functional or causes data integrity issues
- 🟠 **High** — Feature is partially working but has a broken core workflow
- 🟡 **Medium** — Feature works visually but is disconnected from real data or backend

---

## 1. CUSTOMER PORTAL (`/customer-portal`)

### 1.1 Booking Workflow (`/dashboard/book/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | **"Confirm & Pay" does NOT call `POST /bookings`**. Clicking the button at Step 3 just sets `isSuccess = true` locally. No booking record is ever created in Supabase. | 🔴 Critical | `dashboard/book/page.tsx` L82 |
| 2 | **Payment is completely fake**. The "Pay via UPI" and "Wallet" buttons on Step 3 are non-functional `<button>` tags with no `onClick` handlers. No Razorpay SDK is initialised. No call to `POST /payments/create-order`. | 🔴 Critical | `dashboard/book/page.tsx` L398–L403 |
| 3 | **Receipt PDF uses a hardcoded Booking ID** (`CH-2024-0900`). The real booking ID from the API response is never stored, so the receipt and "Track Shipment" link are fabricated. | 🔴 Critical | `dashboard/book/page.tsx` L99, L205 |
| 4 | **Wallet balance is hardcoded `₹0`** on the payment screen. No call to a wallet balance API is made. | 🟠 High | `dashboard/book/page.tsx` L402 |
| 5 | **Cargo type is not sent to the fare API**. `loadType` is hardcoded to `"BOXES_CARTONS"` regardless of user selection. | 🟠 High | `dashboard/book/page.tsx` L51 |
| 6 | **`helpersRequested` is always 0**. The booking form has no helper count input, so the fare calculation never accounts for helper charges, which are defined in the README and fare engine. | 🟡 Medium | `dashboard/book/page.tsx` L52 |

---

### 1.2 QuickBook Card on Dashboard (`/dashboard/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 7 | **"Book Now" from the dashboard navigates to `/dashboard/book` but never submits a booking**. It only routes to the booking page — the actual booking creation (Issue #1) is still broken there. | 🟠 High | `QuickBookCard.tsx` L75–L78 |
| 8 | **Load type hardcoded** to `"BOXES_CARTONS"` on fare estimate too. | 🟡 Medium | `QuickBookCard.tsx` L47 |

---

### 1.3 Orders Page (`/dashboard/orders/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 9 | **Entire orders list is hardcoded mock data**. The 4 fake orders (`CH-0821`, `CH-0819`, etc.) are a static array at the top of the file — no API call to `GET /bookings`. | 🔴 Critical | `orders/page.tsx` L6–L11 |
| 10 | **Search bar is non-functional**. The `<input>` has no `onChange` handler and no filter logic. | 🟡 Medium | `orders/page.tsx` L25–L29 |
| 11 | **Filter button does nothing**. The "Filter" `<button>` has no `onClick`. | 🟡 Medium | `orders/page.tsx` L32 |
| 12 | **"View" action button (ExternalLink icon) goes nowhere**. No route or modal is opened. | 🟡 Medium | `orders/page.tsx` L93–L95 |

---

### 1.4 Tracking Page (`/dashboard/track/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 13 | **Entire tracking page shows hardcoded data**. Booking ID (`CH-2024-0821`), driver name (`Ramesh Kumar`), rating (4.8), ETA (45 mins), route (Mumbai → Pune) — all static strings. No API call or Socket.io room join. | 🔴 Critical | `track/page.tsx` L8–L14, L28, L78 |
| 14 | **No real-time driver location on the map**. The `<LiveMap>` component is embedded but never receives the driver's live GPS coordinates. According to the README, the website should join the Socket.io `booking:{bookingId}` room and receive `driver:location` events. None of this is implemented. | 🔴 Critical | `track/page.tsx` L20 |
| 15 | **Page does not use the `?id=` query param**. The URL can receive a booking ID but the component ignores it — it always shows the same fake booking. | 🔴 Critical | `track/page.tsx` (entire component) |
| 16 | **"Call Driver" button is a `<button>` shell** with no `onClick` or phone number sourced from an API. | 🟡 Medium | `track/page.tsx` L83–L85 |
| 17 | **"Share Link" and "Report Issue" buttons are non-functional** `<button>` shells. | 🟡 Medium | `track/page.tsx` L101–L106 |

---

### 1.5 Payments Page (`/dashboard/payments/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 18 | **Entire payment history is hardcoded mock data**. 4 fake transactions (`TXN-0821`, etc.) are a static array. No call to a payments/wallet API. | 🔴 Critical | `payments/page.tsx` L6–L11 |
| 19 | **Wallet balance is hardcoded `₹250`**. No API call to get the real balance. | 🔴 Critical | `payments/page.tsx` L34 |
| 20 | **"Total Spent" (`₹12,480`) and "Total Added" (`₹12,730`) are hardcoded**. No API-driven stats. | 🔴 Critical | `payments/page.tsx` L57, L75 |
| 21 | **"Add Funds" button is a non-functional shell**. No Razorpay wallet top-up flow is implemented. | 🟠 High | `payments/page.tsx` L36–L38 |
| 22 | **"View All" link and invoice receipt buttons do nothing**. | 🟡 Medium | `payments/page.tsx` L95, L125–L127 |

---

### 1.6 Addresses Page (`/dashboard/addresses/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 23 | **Addresses are stored only in Zustand memory (client-side)**. Refreshing the page wipes all saved addresses. No call to a backend addresses API — the `addressStore.ts` uses a simple in-memory array. According to the README, address data should persist in Supabase. | 🔴 Critical | `addressStore.ts` L24–L73 |
| 24 | **Address count in the dashboard stat card (`stats.savedAddresses`) will always be 0** because no real addresses API is being called. | 🟡 Medium | `dashboard/page.tsx` L93 |

---

### 1.7 Settings Page (`/dashboard/settings/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 25 | **"Change Avatar" button is a dead stub**. It fires `alert("Avatar upload not yet implemented.")`. The `POST /auth/upload-avatar` endpoint exists in the backend, but the settings page does not call it. | 🟠 High | `settings/page.tsx` L108 |
| 26 | **"Notifications" and "Security" sidebar tabs are non-functional**. They are plain `<button>` tags with no state changes — clicking them does nothing. | 🟡 Medium | `settings/page.tsx` L83–L89 |
| 27 | **Language preference selector has no persistence**. The `<select>` is a UI element only — selection is not saved anywhere. | 🟡 Medium | `settings/page.tsx` L171–L175 |

---

### 1.8 Support Page (`/dashboard/support/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 28 | **"Raise a Ticket" form does nothing**. The `<form>` has no `onSubmit` handler. Clicking "Submit Ticket" reloads the page with no API call to create a support ticket. | 🟠 High | `support/page.tsx` L134–L155 |
| 29 | **FAQ items are not expandable**. The accordion items have no click state — the answers (`faq.a`) are defined in the data but never rendered in the UI. | 🟡 Medium | `support/page.tsx` L166–L174 |

---

### 1.9 Dashboard Overview (`/dashboard/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 30 | **Dashboard stats silently fail if the backend is down**. `fetchDashboardData()` catches errors and sets `isLoading: false` but leaves `stats: null`, rendering all stat cards as `0` with no user-facing error state or retry button. | 🟡 Medium | `dashboardStore.ts` L58–L61 |

---

### 1.10 Driver Portal (`/driver/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 31 | **All earnings data is hardcoded mock data**. `₹2,840` today, `₹12,450` weekly, trip history — all static. No call to `GET /drivers/:id/earnings`. | 🔴 Critical | `driver/page.tsx` (confirmed in previous session) |
| 32 | **Online/Offline toggle does not call `PATCH /drivers/availability`**. The toggle is a visual-only switch with no backend connection. | 🔴 Critical | `driver/page.tsx` |
| 33 | **No Socket.io connection for incoming bookings**. The driver portal on the website should join the `driver:{driverId}` room and receive `booking:new` events. This is not implemented. | 🔴 Critical | README §9 |
| 34 | **KYC status check before going online is missing**. The README requires `kycStatus = VERIFIED` before a driver can toggle available. The UI toggle has no such guard. | 🟠 High | `driver/page.tsx` |

---

### 1.11 Missing Features Required by README

| # | Feature | README Section | Status |
|---|---------|---------------|--------|
| 35 | **Trip Rating Flow** — User rates driver after payment (1–5 stars + comment via `POST /ratings/:bookingId`) | §8.6 | ❌ Not built |
| 36 | **GST Invoice Download** — `GET /api/invoice/:id` PDF download after delivery | §8.8 | ❌ Not built (only fake receipt PDF exists) |
| 37 | **Cancel Booking** — Button on orders/tracking page to call `PATCH /bookings/:id/cancel` | §8.2 | ❌ Not built |
| 38 | **Find Nearby Drivers** — `GET /drivers/nearby` shown on the booking map before confirming | §8.4 | ❌ Not built |
| 39 | **Socket.io — User joins booking room** after booking creation to receive real-time driver location | §9 | ❌ Not built |
| 40 | **Cargo Photo Upload** — `POST /bookings/:id/cargo-photo` at pickup | §8.7 | ❌ Not built |

---

---

## 2. ADMIN DASHBOARD (`/admin-dashboard`)

### 2.1 Overview Dashboard (`/admin/(dashboard)/dashboard/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 41 | **All stats are hardcoded mock data** from `lib/mockData.ts`. `DASHBOARD_STATS`, `LIVE_EVENTS`, `BOOKING_TRENDS`, `RECENT_BOOKINGS` — all fake. No calls to `GET /admin/analytics/revenue` or `GET /admin/bookings`. | 🔴 Critical | `dashboard/page.tsx` L9 |
| 42 | **"Live Activity" feed is a static array**. It does not connect to a Socket.io admin room to receive real-time events. | 🔴 Critical | `dashboard/page.tsx` L84 |
| 43 | **Booking chart data is fake**. No API call to `GET /admin/analytics/*` for trend data. | 🔴 Critical | `dashboard/page.tsx` L64 |

---

### 2.2 KYC Review Page (`/admin/(dashboard)/kyc-review/page.tsx`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 44 | **All KYC applications are mock data** from `KYC_APPLICATIONS` in `mockData.ts`. No call to `GET /admin/drivers?kycStatus=PENDING`. | 🔴 Critical | `kyc-review/page.tsx` L5 |
| 45 | **"Approve" and "Reject" buttons are non-functional**. They have no `onClick` — clicking does nothing. No call to `PATCH /admin/drivers/:id/verify`. | 🔴 Critical | `kyc-review/page.tsx` L80–L85 |
| 46 | **Document preview shows a placeholder image**, not the actual Cloudinary-hosted documents uploaded by the driver. | 🔴 Critical | `kyc-review/page.tsx` L110–L113 |
| 47 | **Filter tabs (All / Pending / Approved / Rejected) filter nothing**. The `activeTab` state changes but no data filtering or re-fetch occurs. | 🟡 Medium | `kyc-review/page.tsx` L11–L35 |

---

### 2.3 Other Admin Sub-Pages (Confirmed Empty or Mock)

| # | Page | Issue | Severity |
|---|------|-------|----------|
| 48 | **Bookings** (`/admin/bookings`) | Uses `mockData.ts`. No call to `GET /admin/bookings` with filters. Admin cancel override not implemented. | 🔴 Critical |
| 49 | **Customers** (`/admin/customers`) | Mock data. No call to `GET /admin/users`. | 🔴 Critical |
| 50 | **Drivers** (`/admin/drivers`) | Mock data. No call to `GET /admin/drivers`. Suspend/reinstate buttons are stubs. | 🔴 Critical |
| 51 | **Revenue** (`/admin/revenue`) | Mock data. No call to `GET /admin/analytics/revenue`. | 🔴 Critical |
| 52 | **Promo Codes** (`/admin/promo-codes`) | Unknown — not audited in depth, likely mock data. | 🟠 High |
| 53 | **Broadcasts** (`/admin/broadcasts`) | Unknown — not audited in depth. | 🟠 High |

---

### 2.4 Missing Admin Features Required by README

| # | Feature | README Section | Status |
|---|---------|---------------|--------|
| 54 | **Booking Heatmap** — `GET /admin/analytics/heatmap` → deck.gl HeatmapLayer | §8.9 | ❌ Not built |
| 55 | **Driver Suspension** — `PATCH /admin/drivers/:id/status` + immediate Socket.io termination | §8.4 | ❌ Not connected |
| 56 | **Admin Override Cancel** — `PATCH /admin/bookings/:id/cancel` with mandatory reason | §8.2 | ❌ Not connected |
| 57 | **B2B Account Upgrade** — Admin can upgrade a USER to B2B (`account_type = 'B2B'`) | §1 Role Assignment | ❌ No UI for this |

---

---

## 3. B2B PORTAL (`/b2b-portal`)

| # | Issue | Severity | File |
|---|-------|----------|------|
| 58 | **The entire B2B portal is an empty placeholder** — `app/page.tsx` only renders `<div>B2B Portal</div>`. | 🔴 Critical | `b2b-portal/app/page.tsx` |
| 59 | **Bulk booking via form or CSV upload** (`POST /bookings/bulk`) is not implemented. | 🔴 Critical | README §8.11 |
| 60 | **Fleet invoice management** (`GET /business/invoices`) is not implemented. | 🔴 Critical | README §8.11 |
| 61 | **B2B authentication + route guard** is not implemented (no redirect from the empty page if not a B2B account). | 🔴 Critical | README §3 |

---

---

## Summary Table

| Portal | Critical 🔴 | High 🟠 | Medium 🟡 | Total |
|--------|------------|--------|---------|-------|
| Customer Portal | 16 | 8 | 12 | **36** |
| Admin Dashboard | 9 | 2 | 1 | **12** |
| B2B Portal | 4 | 0 | 0 | **4** |
| **Total** | **29** | **10** | **13** | **52** |

---

## Priority Fix Order (Recommended)

1. **`POST /bookings` integration** in `/dashboard/book/page.tsx` — core revenue flow
2. **Razorpay payment sheet** — `POST /payments/create-order` → SDK → `POST /payments/verify`
3. **Orders page** — real `GET /bookings` API call replacing mock array
4. **Tracking page** — query-param based fetch + Socket.io room join
5. **Admin KYC approve/reject** — `PATCH /admin/drivers/:id/verify`
6. **Admin stats/dashboard** — replace all `mockData.ts` imports
7. **Driver portal** — earnings API + availability toggle backend call
8. **Payments page** — real wallet balance + transaction history API
9. **B2B Portal** — build from scratch
10. **Addresses persistence** — backend-persisted addresses API
