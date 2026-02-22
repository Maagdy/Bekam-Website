import { createContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import api, { setAccessToken } from '../lib/api';
import type { Session, User as AuthUser } from '@supabase/supabase-js';

interface AppUser {
  id: string;
  phone: string | null;
  display_name: string | null;
  preferred_lang: 'ar' | 'en';
  region_id: string | null;
  trust_points: number;
  total_reports: number;
  accepted_reports: number;
  role: 'user' | 'admin' | 'moderator';
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  authUser: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  signInWithOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  async function fetchProfile() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch {
      setUser(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s) {
        setAccessToken(s.access_token);
        await fetchProfile();
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setAuthUser(s?.user ?? null);
      if (s) {
        setIsLoading(true);
        await fetchProfile();
        setIsLoading(false);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithOtp(phone: string) {
    await api.post('/auth/otp/send', { phone });
  }

  async function verifyOtp(phone: string, token: string) {
    // Normalize: strip +, then ensure +2 prefix
    const stripped = phone.replace(/^\+/, '');
    const normalizedPhone = stripped.startsWith('2') ? '+' + stripped : '+2' + stripped;

    const { error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token,
      type: 'sms',
    });

    if (error) throw error;
  }

  async function signInWithEmail(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function signUpWithEmail(email: string, password: string) {
    // 1. Create account via backend (auto-confirmed + users row created)
    await api.post('/auth/register', { email, password });

    // 2. Auto sign-in after successful registration
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAuthUser(null);
  }

  async function updateProfile(data: Partial<AppUser>) {
    const { data: result } = await api.put('/auth/me', data);
    setUser(result.data);
  }

  async function refreshUser() {
    await fetchProfile();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        authUser,
        isLoading,
        isAdmin,
        signInWithOtp,
        verifyOtp,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
