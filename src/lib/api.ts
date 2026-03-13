import axios from 'axios';
import i18n from './i18n';
import { supabase } from './supabase';

let cachedAccessToken: string | null = null;

// Keep cache updated on auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  cachedAccessToken = session?.access_token ?? null;
});

export function setAccessToken(token: string | null) {
  cachedAccessToken = token;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
});

// Synchronous interceptor — never blocks requests
api.interceptors.request.use((config) => {
  if (cachedAccessToken) {
    config.headers.Authorization = `Bearer ${cachedAccessToken}`;
  }
  config.headers['Accept-Language'] = i18n.language || 'ar';
  return config;
});

export default api;
