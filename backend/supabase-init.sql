-- Execute this in your Supabase SQL Editor

-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('USER', 'DRIVER', 'ADMIN', 'BUSINESS')),
  account_type TEXT NOT NULL DEFAULT 'STANDARD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL REFERENCES users(firebase_uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  is_available BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  earnings_today DECIMAL(10, 2) DEFAULT 0,
  earnings_this_week DECIMAL(10, 2) DEFAULT 0,
  earnings_this_month DECIMAL(10, 2) DEFAULT 0,
  earnings_trip_count INTEGER DEFAULT 0,
  profile_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(firebase_uid),
  driver_id TEXT REFERENCES drivers(firebase_uid),
  pickup_lat DECIMAL(10, 7) NOT NULL,
  pickup_lng DECIMAL(10, 7) NOT NULL,
  pickup_address TEXT NOT NULL,
  drop_lat DECIMAL(10, 7) NOT NULL,
  drop_lng DECIMAL(10, 7) NOT NULL,
  drop_address TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  load_type TEXT NOT NULL,
  helpers_requested INTEGER DEFAULT 0,
  fare_estimate DECIMAL(10, 2) NOT NULL,
  final_fare DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DRIVER_ARRIVING', 'ARRIVED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')),
  payment_status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PENDING', 'PAID', 'REFUNDED')),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id TEXT NOT NULL REFERENCES drivers(firebase_uid),
  user_id TEXT NOT NULL REFERENCES users(firebase_uid),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 🚀 PERFORMANCE OPTIMIZATIONS (INDEXES)
-- ==========================================

-- Bookings Table Indexes (Heavily queried for tracking and history)
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Drivers Table Indexes (Heavily queried for matchmaking)
CREATE INDEX IF NOT EXISTS idx_drivers_is_available ON drivers(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_drivers_kyc_status ON drivers(kyc_status);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle_type ON drivers(vehicle_type);

-- Users Table Indexes (Queried for B2B/Admin validation)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);

-- Ratings Table Indexes
CREATE INDEX IF NOT EXISTS idx_ratings_driver_id ON ratings(driver_id);
