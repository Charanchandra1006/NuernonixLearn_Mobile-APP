import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  onboardingCompleted: boolean;
  profile?: {
    grade?: string;
    subjectInterests: string[];
    weakAreas: string[];
    preferredLearningStyle: string;
    learningGoals: string[];
    currentPerformanceLevel: string;
    pacePreference: string;
  };
  studentProfile?: {
    totalXP: number;
    level: number;
    badges: string[];
    subscriptionPlan: string;
    learningStreak: number;
  };
  cognitiveLoad?: number;
  progress?: {
    currentStreak: number;
    totalTimeSpent: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string, email: string, password: string, role?: string,
    phone?: string, learningPace?: string, experienceLevel?: string, subjects?: string[]
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  completeOnboarding: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const res = await authAPI.login(email, password);
    const { token, user } = res.data;
    await AsyncStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },

  register: async (name, email, password, role = 'student', phone, learningPace, experienceLevel, subjects) => {
    const res = await authAPI.register({ name, email, password, role, phone, learningPace: learningPace as any, experienceLevel: experienceLevel as any, subjects });
    const { token, user } = res.data;
    await AsyncStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'adminToken']);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      set({ token });
      const res = await authAPI.getMe();
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      await AsyncStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (data) => {
    const { user } = get();
    if (user) set({ user: { ...user, ...data } });
  },

  completeOnboarding: async (data) => {
    const res = await authAPI.completeOnboarding(data);
    set({ user: res.data.user });
  },
}));
