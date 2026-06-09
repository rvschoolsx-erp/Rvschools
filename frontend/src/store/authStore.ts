import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { apiService } from '@/lib/api';

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface AuthState {
  user:        AuthUser | null;
  accessToken: string | null;
  isLoading:   boolean;
  isAuthenticated: boolean;
  login:       (identifier: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
  setUser:     (user: AuthUser) => void;
  initialize:  () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (identifier: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data } = await apiService.auth.login({ identifier, password });
          const { accessToken, user } = data.data;

          Cookies.set('accessToken', accessToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: 1 / 96, // 15 minutes
          });

          set({ user, accessToken, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await apiService.auth.logout();
        } finally {
          Cookies.remove('accessToken');
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      initialize: async () => {
        const token = Cookies.get('accessToken');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const { data } = await apiService.auth.me();
          set({ user: get().user, isAuthenticated: true });
        } catch {
          Cookies.remove('accessToken');
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },
    }),
    {
      name:    'school-erp-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
