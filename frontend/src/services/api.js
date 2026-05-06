import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Supabase JWT token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to unwrap backend data structure
api.interceptors.response.use((response) => {
  // Return the inner data object directly for easier access in components
  // Most components do: const { data } = await api.get(...)
  // If we return response.data, then data will be the payload [...]
  return response.data;
}, (error) => {
  return Promise.reject(error);
});

export default api;
