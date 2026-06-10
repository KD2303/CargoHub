import { create } from 'zustand';
import { auth as firebaseAuth } from '@/lib/firebase';
import type { Booking } from '@cargohub/shared';

interface DashboardStats {
  totalBookings: number;
  activeShipments: number;
  totalSpent: number;
  savedAddresses: number;
}

interface DashboardState {
  isSidebarCollapsed: boolean;
  stats: DashboardStats | null;
  recentBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isSidebarCollapsed: false,
  stats: null,
  recentBookings: [],
  isLoading: false,
  error: null,

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        set({ stats: null, recentBookings: [], isLoading: false, error: 'User not authenticated' });
        return;
      }
      const idToken = await currentUser.getIdToken();
      
      const [statsRes, bookingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/bookings/stats', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        }),
        fetch('http://localhost:5000/api/bookings?limit=5', {
          headers: { 'Authorization': `Bearer ${idToken}` }
        })
      ]);

      const statsData = await statsRes.json();
      const bookingsData = await bookingsRes.json();

      set({
        stats: statsData.success ? statsData.data : null,
        recentBookings: bookingsData.success ? bookingsData.data : [],
        isLoading: false,
        error: (!statsData.success && !bookingsData.success) ? 'Failed to fetch dashboard data' : null
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      set({ isLoading: false, error: error.message || 'Network error occurred' });
    }
  }
}));
