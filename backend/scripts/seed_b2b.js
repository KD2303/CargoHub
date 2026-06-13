const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding B2B fleet data...");

  // 1. Find the B2B User (or any user)
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('firebase_uid')
    .eq('role', 'USER') // Or 'BUSINESS'
    .limit(1);

  if (userError || !users || users.length === 0) {
    console.error("No users found to assign the fleet to. Please register a user first.");
    process.exit(1);
  }

  const userId = users[0].firebase_uid;
  console.log(`Assigning fleet to User ID: ${userId}`);

  // 2. Insert 5 Mock Drivers
  const mockDrivers = [
    { firebase_uid: `drv_${uuidv4()}`, name: "Rajesh Kumar", phone: "9876543210", vehicle_type: "Container (20ft)", vehicle_number: "MH-04-AB-1234", is_available: true, kyc_status: 'VERIFIED' },
    { firebase_uid: `drv_${uuidv4()}`, name: "Suresh Singh", phone: "9876543211", vehicle_type: "Open Truck (14ft)", vehicle_number: "DL-1C-XY-9876", is_available: true, kyc_status: 'VERIFIED' },
    { firebase_uid: `drv_${uuidv4()}`, name: "Amit Patel", phone: "9876543212", vehicle_type: "Trailer (40ft)", vehicle_number: "GJ-01-PQ-4567", is_available: true, kyc_status: 'VERIFIED' },
    { firebase_uid: `drv_${uuidv4()}`, name: "Mohammad Ali", phone: "9876543213", vehicle_type: "Mini Truck", vehicle_number: "KA-05-MN-2345", is_available: true, kyc_status: 'VERIFIED' },
    { firebase_uid: `drv_${uuidv4()}`, name: "Vikram Sharma", phone: "9876543214", vehicle_type: "Container (20ft)", vehicle_number: "UP-32-KL-6789", is_available: true, kyc_status: 'VERIFIED' }
  ];

  const { error: drvError } = await supabase.from('drivers').insert(mockDrivers);
  if (drvError) {
    console.error("Error inserting drivers:", drvError);
    return;
  }
  console.log("Inserted 5 drivers.");

  // 3. Insert 5 Active Bookings
  const mockBookings = [
    {
      booking_ref: `FA-B2B-${uuidv4().substring(0, 8).toUpperCase()}`,
      user_id: userId,
      driver_id: mockDrivers[0].firebase_uid,
      pickup_lat: 19.0760, pickup_lng: 72.8777, pickup_address: "Mumbai Port Trust, Mumbai, Maharashtra", // Mumbai
      drop_lat: 28.7041, drop_lng: 77.1025, drop_address: "Okhla Industrial Estate, New Delhi", // Delhi
      vehicle_type: "Container (20ft)",
      load_type: "Electronics",
      fare_estimate: 45000,
      status: "IN_TRANSIT"
    },
    {
      booking_ref: `FA-B2B-${uuidv4().substring(0, 8).toUpperCase()}`,
      user_id: userId,
      driver_id: mockDrivers[1].firebase_uid,
      pickup_lat: 12.9716, pickup_lng: 77.5946, pickup_address: "Peenya Industrial Area, Bengaluru", // Bangalore
      drop_lat: 13.0827, drop_lng: 80.2707, drop_address: "Chennai Port, Chennai, Tamil Nadu", // Chennai
      vehicle_type: "Open Truck (14ft)",
      load_type: "Machinery",
      fare_estimate: 12000,
      status: "DELAYED"
    },
    {
      booking_ref: `FA-B2B-${uuidv4().substring(0, 8).toUpperCase()}`,
      user_id: userId,
      driver_id: mockDrivers[2].firebase_uid,
      pickup_lat: 22.5726, pickup_lng: 88.3639, pickup_address: "Haldia Dock Complex, Kolkata", // Kolkata
      drop_lat: 25.5941, drop_lng: 85.1376, drop_address: "Patna Industrial Area, Bihar", // Patna
      vehicle_type: "Trailer (40ft)",
      load_type: "Steel Pipes",
      fare_estimate: 35000,
      status: "IN_TRANSIT"
    },
    {
      booking_ref: `FA-B2B-${uuidv4().substring(0, 8).toUpperCase()}`,
      user_id: userId,
      driver_id: mockDrivers[3].firebase_uid,
      pickup_lat: 18.5204, pickup_lng: 73.8567, pickup_address: "Chakan MIDC, Pune, Maharashtra", // Pune
      drop_lat: 19.0760, drop_lng: 72.8777, drop_address: "Andheri East, Mumbai", // Mumbai
      vehicle_type: "Mini Truck",
      load_type: "Auto Parts",
      fare_estimate: 5000,
      status: "IN_TRANSIT"
    },
    {
      booking_ref: `FA-B2B-${uuidv4().substring(0, 8).toUpperCase()}`,
      user_id: userId,
      driver_id: mockDrivers[4].firebase_uid,
      pickup_lat: 23.0225, pickup_lng: 72.5714, pickup_address: "Sanand GIDC, Ahmedabad, Gujarat", // Ahmedabad
      drop_lat: 26.9124, drop_lng: 75.7873, drop_address: "Sitapura Industrial Area, Jaipur", // Jaipur
      vehicle_type: "Container (20ft)",
      load_type: "Textiles",
      fare_estimate: 25000,
      status: "DELIVERED"
    }
  ];

  const { error: bkgError } = await supabase.from('bookings').insert(mockBookings);
  if (bkgError) {
    console.error("Error inserting bookings:", bkgError);
    return;
  }
  console.log("Inserted 5 active B2B bookings for fleet tracking.");
  
  console.log("✅ Seed completed successfully!");
}

seed();
