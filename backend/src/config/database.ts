import { supabase } from './supabase';
import { redis } from './redis';
import type { UserProfile, DriverProfile, Booking, Rating, AuditLog, BookingStatus, VehicleType } from '@cargohub/shared';

// Helper to convert DB snake_case to JS camelCase (simplified for this mock)
const toCamel = (obj: any) => {
  if (!obj) return obj;
  const newObj: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  return newObj;
};

const toSnake = (obj: any) => {
  if (!obj) return obj;
  const newObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  return newObj;
};

const formatDriver = (data: any): DriverProfile | null => {
  if (!data) return null;
  const camel = toCamel(data);
  return {
    ...camel,
    earnings: camel.earnings || { today: 0, thisWeek: 0, thisMonth: 0, tripCount: 0 }
  } as DriverProfile;
};

const flattenDriver = (driver: any) => {
  if (!driver) return driver;
  // Supabase 'drivers' table now uses JSONB for 'earnings' column
  return toSnake(driver);
};

export const db = {
  users: {
    findByFirebaseUid: async (uid: string): Promise<UserProfile | null> => {
      const { data, error } = await supabase.from('users').select('*').eq('firebase_uid', uid).single();
      if (error) return null;
      return toCamel(data) as UserProfile;
    },
    create: async (user: UserProfile) => {
      const { data, error } = await supabase.from('users').insert(toSnake(user)).select().single();
      if (error) throw error;
      return toCamel(data);
    },
    update: async (uid: string, updates: Partial<UserProfile>) => {
      const { data, error } = await supabase.from('users').update(toSnake(updates)).eq('firebase_uid', uid).select().single();
      if (error) throw error;
      return toCamel(data);
    }
  },

  drivers: {
    getAll: async () => {
      const { data, error } = await supabase.from('drivers').select('*');
      if (error) return [];
      return (data || []).map(formatDriver).filter(Boolean) as DriverProfile[];
    },
    findById: async (id: string): Promise<DriverProfile | null> => {
      const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single();
      if (error) return null;
      return formatDriver(data);
    },
    findByFirebaseUid: async (uid: string): Promise<DriverProfile | null> => {
      const { data, error } = await supabase.from('drivers').select('*').eq('firebase_uid', uid).single();
      if (error) return null;
      return formatDriver(data);
    },
    create: async (driver: DriverProfile) => {
      const { data, error } = await supabase.from('drivers').insert(flattenDriver(driver)).select().single();
      if (error) throw error;
      return formatDriver(data);
    },
    update: async (uid: string, updates: Partial<DriverProfile>) => {
      const { data, error } = await supabase.from('drivers').update(flattenDriver(updates)).eq('firebase_uid', uid).select().single();
      if (error) throw error;
      return formatDriver(data);
    },
    findNearby: async (lat: number, lng: number, vehicleType?: VehicleType, radiusKm = 15) => {
      // Use Redis geospatial query for active drivers
      if (!redis) return []; // Fallback if redis is down
      
      const nearbyKeys = await redis.geosearch('drivers:location', 
        { type: 'FROMLONLAT', coordinate: { lon: lng, lat: lat } },
        { type: 'BYRADIUS', radius: radiusKm, radiusType: 'KM' },
        'ASC',
        { withDist: true }
      );
      
      // Fetch details from Supabase (in prod we'd just fetch the IDs and do a batch query)
      const drivers = [];
      for (const item of nearbyKeys as any[]) {
        const driverId = item.member;
        const distance = item.dist;
        const { data } = await supabase.from('drivers').select('*').eq('firebase_uid', driverId).single();
        if (data && data.is_available && data.kyc_status === 'VERIFIED') {
          if (!vehicleType || data.vehicle_type === vehicleType) {
            const formatted = formatDriver(data);
            if (formatted) {
              drivers.push({ ...formatted, distance });
            }
          }
        }
      }
      return drivers;
    }
  },

  bookings: {
    getAll: async (filters: any) => {
      let query = supabase.from('bookings').select('*', { count: 'exact' });
      if (filters.status) query = query.eq('status', filters.status);
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);
      if (error) throw error;
      return {
        data: (data || []).map(toCamel),
        total: count || 0,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil((count || 0) / filters.limit)
      };
    },
    findById: async (id: string): Promise<Booking | null> => {
      const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single();
      if (error) return null;
      return toCamel(data) as Booking;
    },
    create: async (booking: Booking) => {
      const { data, error } = await supabase.from('bookings').insert(toSnake(booking)).select().single();
      if (error) throw error;
      return toCamel(data);
    },
    update: async (id: string, updates: Partial<Booking>) => {
      const { data, error } = await supabase.from('bookings').update(toSnake(updates)).eq('id', id).select().single();
      if (error) throw error;
      return toCamel(data);
    },
    findByUserId: async (userId: string, page = 1, limit = 20, status?: BookingStatus) => {
      let query = supabase.from('bookings').select('*', { count: 'exact' }).eq('user_id', userId);
      if (status) query = query.eq('status', status);
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) throw error;
      return {
        data: data.map(toCamel),
        total: count || 0,
        page, limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
    findAvailable: async () => {
      const { data, error } = await supabase.from('bookings')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []).map(toCamel) as Booking[];
    },
    findDriverActive: async (driverId: string) => {
      const { data, error } = await supabase.from('bookings')
        .select('*')
        .eq('driver_id', driverId)
        .not('status', 'in', '("DELIVERED","CANCELLED")')
        .limit(1)
        .single();
      if (error || !data) return null;
      return toCamel(data);
    },
    getUserStats: async (userId: string) => {
      const { data, error } = await supabase.from('bookings').select('fare_estimate, status').eq('user_id', userId);
      if (error) throw error;
      
      const totalBookings = data.length;
      const activeShipments = data.filter((b: any) => ['PENDING', 'ACCEPTED', 'DRIVER_ARRIVING', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status)).length;
      const totalSpent = data.reduce((sum: number, b: any) => sum + (b.fare_estimate || 0), 0);
      const savedAddresses = 2; // Optional fallback for now
      
      return { totalBookings, activeShipments, totalSpent, savedAddresses };
    },
    findByDriverId: async (driverId: string, page = 1, limit = 20, status?: BookingStatus) => {
      let query = supabase.from('bookings').select('*', { count: 'exact' }).eq('driver_id', driverId);
      if (status) query = query.eq('status', status);
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) throw error;
      return {
        data: data.map(toCamel),
        total: count || 0,
        page, limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    }
  },

  auditLogs: {
    create: async (log: AuditLog) => {
      const { data, error } = await supabase.from('audit_logs').insert(toSnake(log)).select().single();
      if (error) console.error('Audit Log Error:', error);
      return toCamel(data);
    }
  },

  analytics: {
    getRevenue: async () => {
      return { total: 0, daily: [], weekly: [], monthly: [] };
    },
    getHeatmap: async () => {
      return [];
    },
    getDashboardStats: async () => {
      // Mocked stats for now, but structured exactly as the frontend expects
      return {
        stats: [
          { label: "Total Bookings Today", value: "247", change: "+12%", changeType: "up", accentColor: "blue" },
          { label: "Active Drivers Online", value: "89", change: "↑ from 74", changeType: "up", accentColor: "green" },
          { label: "Revenue Today (₹)", value: "₹1,84,320", change: "+8.2%", changeType: "up", accentColor: "purple" },
          { label: "Pending KYC", value: "3", change: "Needs review", changeType: "down", accentColor: "red" },
        ],
        liveEvents: [
          { id: 1, type: "purple", text: "New booking #BK-1842 — Raj Kumar, Mumbai→Pune", time: "just now" },
          { id: 2, type: "green", text: "Payment received ₹3,200 — Order #BK-1841", time: "2m ago" },
          { id: 3, type: "blue", text: "Driver Amit Singh went online", time: "5m ago" },
          { id: 4, type: "red", text: "Booking #BK-1839 — Cancelled", time: "12m ago" },
          { id: 5, type: "warning", text: "KYC submitted — Suresh Patel (Pending review)", time: "18m ago" },
        ],
        bookingTrends: [
          { day: "Mon", bookings: 180 },
          { day: "Tue", bookings: 195 },
          { day: "Wed", bookings: 210 },
          { day: "Thu", bookings: 190 },
          { day: "Fri", bookings: 230 },
          { day: "Sat", bookings: 260 },
          { day: "Sun", bookings: 247 },
        ],
        recentBookings: [
          { id: "BK-1842", customer: "Raj Kumar", route: "Mumbai → Pune", driver: "Finding...", amount: "₹4,500", status: "Finding Driver", time: "10:42 AM" },
          { id: "BK-1841", customer: "Anita Desai", route: "Delhi → Noida", driver: "Amit Singh", amount: "₹3,200", status: "Completed", time: "10:30 AM" },
          { id: "BK-1840", customer: "Vikram Tech", route: "Bangalore → Hosur", driver: "Ravi K", amount: "₹12,400", status: "Ongoing", time: "09:15 AM" },
          { id: "BK-1839", customer: "Sneha Patel", route: "Surat → Vapi", driver: "-", amount: "₹2,100", status: "Cancelled", time: "08:50 AM" },
          { id: "BK-1838", customer: "Rahul M", route: "Chennai → Vellore", driver: "Karthik R", amount: "₹6,800", status: "Ongoing", time: "08:10 AM" },
        ]
      };
    }
  },

  ratings: {
    findByBookingId: async (bookingId: string) => {
      const { data, error } = await supabase.from('ratings').select('*').eq('booking_id', bookingId).single();
      if (error) return null;
      return toCamel(data);
    },
    create: async (rating: any) => {
      const { data, error } = await supabase.from('ratings').insert(toSnake(rating)).select().single();
      if (error) throw error;
      return toCamel(data);
    }
  },

  notificationTokens: {
    set: async (uid: string, tokens: any) => {
      console.log(`Setting notification tokens for ${uid}`, tokens);
      return true;
    }
  }
};
