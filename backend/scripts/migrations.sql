-- ==========================================
-- FAR AWAY 2026 Backend Migration
-- Full Database Schema Initialization
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    gender TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    profile_completed BOOLEAN DEFAULT FALSE,
    fcm_token TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    account_type TEXT NOT NULL DEFAULT 'STANDARD',
    profile_photo TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Drivers Table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    kyc_status TEXT DEFAULT 'UNSUBMITTED',
    is_available BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    vehicle_type TEXT,
    vehicle_number TEXT,
    profile_photo TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_trips INTEGER DEFAULT 0,
    current_lat FLOAT,
    current_lng FLOAT,
    aadhaar_url TEXT,
    license_url TEXT,
    rc_url TEXT,
    vehicle_photo_url TEXT,
    earnings JSONB DEFAULT '{"today":0,"thisWeek":0,"thisMonth":0,"tripCount":0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    driver_id TEXT,
    pickup_lat FLOAT NOT NULL,
    pickup_lng FLOAT NOT NULL,
    pickup_address TEXT NOT NULL,
    drop_lat FLOAT NOT NULL,
    drop_lng FLOAT NOT NULL,
    drop_address TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    load_type TEXT NOT NULL,
    helpers_requested INTEGER DEFAULT 0,
    fare_estimate DECIMAL(10,2) NOT NULL,
    final_fare DECIMAL(10,2),
    status TEXT DEFAULT 'PENDING',
    payment_status TEXT DEFAULT 'UNPAID',
    cargo_photo_url TEXT,
    cancellation_reason TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ratings Table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    driver_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_uid TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Because Firebase handles Auth, we don't strictly link 'users.id' with 'bookings.user_id' via Foreign Key 
-- since bookings often use the string 'firebase_uid' directly, but we enforce uniqueness on firebase_uid.
