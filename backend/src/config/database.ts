import { supabase } from './supabase';
import { redis } from './redis';
import type { UserProfile, DriverProfile, Booking, Rating, AuditLog, BookingStatus, VehicleType } from '@cargohub/shared';
import { liveUsers } from '../shared/liveUsers';

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
    },
    getAll: async () => {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return (data || []).map(toCamel) as UserProfile[];
    },
    delete: async (uid: string) => {
      const { error } = await supabase.from('users').delete().eq('firebase_uid', uid);
      if (error) throw error;
      return true;
    },
    getActiveCount: async () => {
      const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true);
      if (error) return 0;
      return count || 0;
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
    delete: async (id: string) => {
      const { error } = await supabase.from('drivers').delete().eq('firebase_uid', id).or(`id.eq.${id}`);
      if (error) throw error;
      return true;
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
    delete: async (id: string) => {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      return true;
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
    getAll: async () => {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return (data || []).map(toCamel);
    },
    create: async (log: AuditLog) => {
      const { data, error } = await supabase.from('audit_logs').insert(toSnake(log)).select().single();
      if (error) console.error('Audit Log Error:', error);
      return toCamel(data);
    }
  },

  broadcasts: {
    getAll: async () => {
      const { data, error } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return (data || []).map(toCamel);
    },
    create: async (broadcast: any) => {
      const { data, error } = await supabase.from('broadcasts').insert(toSnake(broadcast)).select().single();
      if (error) throw error;
      return toCamel(data);
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('broadcasts').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  promoCodes: {
    getAll: async () => {
      const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
      if (error) return [];
      return (data || []).map(toCamel);
    },
    create: async (promo: any) => {
      const { data, error } = await supabase.from('promo_codes').insert(toSnake(promo)).select().single();
      if (error) throw error;
      return toCamel(data);
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
      return true;
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
      const activeDrivers = liveUsers.DRIVER.size;
      const activeUsers = liveUsers.USER.size;
      const activeAdmins = liveUsers.ADMIN.size;

      const { data: bookings } = await db.bookings.getAll({ page: 1, limit: 1000 });
      const recentBookings = await db.bookings.getAll({ page: 1, limit: 5 });
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysBookings = bookings.filter((b: any) => new Date(b.createdAt) >= today).length;
      
      const { data: users } = await supabase.from('users').select('*');
      const { data: drivers } = await supabase.from('drivers').select('*');

      // Compute simple 7 day trend
      const trends = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);
        
        const dayBookings = bookings.filter((b: any) => {
          const bDate = new Date(b.createdAt);
          return bDate >= d && bDate < nextD;
        }).length;
        
        trends.push({
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          bookings: dayBookings
        });
      }

      // Compute latest 5 events from audit logs
      const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(5);
      const liveEvents = (logs || []).map((l: any, i: number) => {
        let type = 'purple';
        if (l.action.includes('SUSPEND') || l.action.includes('DELETE') || l.action.includes('CANCEL')) type = 'red';
        else if (l.action.includes('CREATE') || l.action.includes('APPROVE') || l.action.includes('REINSTATE')) type = 'green';
        else if (l.action.includes('UPDATE')) type = 'blue';

        return {
          id: l.id || i,
          type,
          text: `Action: ${l.action.replace(/_/g, ' ')}`,
          time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });
      if (liveEvents.length === 0) {
        liveEvents.push({ id: 1, type: "purple", text: "Dashboard Analytics Initialized", time: "just now" });
      }

      return {
        stats: [
          { label: "Total Bookings Today", value: todaysBookings.toString(), change: "Active", changeType: "up", accentColor: "blue" },
          { label: "Registered Drivers", value: (drivers?.length || 0).toString(), change: "Total", changeType: "up", accentColor: "green" },
          { label: "Registered Customers", value: (users?.length || 0).toString(), change: "Total", changeType: "up", accentColor: "purple" },
          { label: "Live Admins", value: activeAdmins.toString(), change: "Managing platform", changeType: "up", accentColor: "red" },
        ],
        liveEvents,
        bookingTrends: trends,
        recentBookings: recentBookings.data.map((b: any) => ({
          id: b.id,
          customer: b.userName || "Unknown",
          route: b.route || "Unknown",
          driver: b.driverId ? "Assigned" : "Finding...",
          amount: `₹${b.fareEstimate || 0}`,
          status: b.status,
          time: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
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
  },

  notifications: {
    // In-memory mock store for notifications
    _data: [] as any[],
    getAllForUser: async (userId: string) => {
      const now = new Date();
      return db.notifications._data
        .filter(n => {
          // Filter out if expired
          if (n.expiresAt && new Date(n.expiresAt) < now) return false;
          // Filter out if read by THIS user
          if (n.readBy && n.readBy.includes(userId)) return false;
          
          return n.targetUid === userId || n.targetUid === 'ALL';
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    create: async (notification: any) => {
      const newNotif = { ...notification, readBy: [] };
      db.notifications._data.push(newNotif);
      return newNotif;
    },
    markAsRead: async (id: string, userId: string) => {
      const idx = db.notifications._data.findIndex(n => n.id === id);
      if (idx !== -1) {
        if (!db.notifications._data[idx].readBy) {
          db.notifications._data[idx].readBy = [];
        }
        if (!db.notifications._data[idx].readBy.includes(userId)) {
          db.notifications._data[idx].readBy.push(userId);
        }
        return true;
      }
      return false;
    }
  }
};
