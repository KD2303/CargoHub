import { create } from 'zustand';
import { UserProfile } from '@cargohub/shared';
import { auth as firebaseAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  fetchProfile: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  initializeAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user, loading: false }),

  fetchProfile: async () => {
    try {
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      const idToken = await currentUser.getIdToken();
      const res = await fetch('http://localhost:5000/api/auth/me', {
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
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        await get().fetchProfile();
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    });
    return unsubscribe;
  }
}));
