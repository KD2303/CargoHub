import { create } from 'zustand';
import { UserProfile } from '@cargohub/shared';
import { auth as firebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  adminToken: string | null;
  adminUser: any | null;
  fetchProfile: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  initializeAuthListener: () => () => void;
  setAdminLogin: (token: string, user: any) => void;
  logoutAdmin: () => void;
  verifyAdminSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  adminToken: null,
  adminUser: null,

  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),

  setAdminLogin: (token, user) => {
    localStorage.setItem('admin_token', token);
    set({ adminToken: token, adminUser: user, isAuthenticated: true, loading: false });
  },

  logoutAdmin: () => {
    localStorage.removeItem('admin_token');
    set({ adminToken: null, adminUser: null, isAuthenticated: false });
  },

  verifyAdminSession: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      // Not an admin session
      return;
    }
    
    try {
      const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + '/api/admin/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        set({ adminToken: token, adminUser: data.user, isAuthenticated: true, loading: false });
      } else {
        get().logoutAdmin();
      }
    } catch (e) {
      get().logoutAdmin();
    }
  },

  fetchProfile: async () => {
    try {
      // Don't override if it's an admin session
      if (get().adminToken) return;

      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      const idToken = await currentUser.getIdToken();
      const res = await fetch((`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`) + '/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      const data = await res.json();
      if (data.success && data.data) {
        set({ user: data.data, isAuthenticated: true, loading: false });
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  initializeAuthListener: () => {
    // First check if there's an admin session in local storage
    if (typeof window !== 'undefined' && localStorage.getItem('admin_token')) {
      get().verifyAdminSession();
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      // Ignore firebase changes if admin is logged in
      if (get().adminToken) return;

      if (firebaseUser) {
        await get().fetchProfile();
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
    return unsubscribe;
  }
}));
