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
      return (data || []).map(toCamel) as DriverProfile[];
    },
    findById: async (id: string): Promise<DriverProfile | null> => {
      const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single();
      if (error) return null;
      return toCamel(data) as DriverProfile;
    },
    findByFirebaseUid: async (uid: string): Promise<DriverProfile | null> => {
      const { data, error } = await supabase.from('drivers').select('*').eq('firebase_uid', uid).single();
      if (error) return null;
      return toCamel(data) as DriverProfile;
    },
    create: async (driver: DriverProfile) => {
      const { data, error } = await supabase.from('drivers').insert(toSnake(driver)).select().single();
      if (error) throw error;
      return toCamel(data);
    },
    update: async (uid: string, updates: Partial<DriverProfile>) => {
      const { data, error } = await supabase.from('drivers').update(toSnake(updates)).eq('firebase_uid', uid).select().single();
      if (error) throw error;
      return toCamel(data);
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
            drivers.push({ ...toCamel(data), distance });
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
    findDriverActive: async (driverId: string) => {
      const { data, error } = await supabase.from('bookings')
        .select('*')
        .eq('driver_id', driverId)
        .not('status', 'in', '("DELIVERED","CANCELLED")')
        .limit(1)
        .single();
      if (error || !data) return null;
      return toCamel(data);
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
  },

  authOTP: {
    setOTP: async (phone: string, otp: string) => {
      if (!redis) throw new Error("Redis unavailable");
      // 5 minute expiration
      await redis.set(`otp:${phone}`, otp, { ex: 300 });
    },
    getOTP: async (phone: string) => {
      if (!redis) return null;
      return await redis.get<string>(`otp:${phone}`);
    },
    deleteOTP: async (phone: string) => {
      if (!redis) return;
      await redis.del(`otp:${phone}`);
    }
  }
};
