import axios from 'axios';
import { authSessionStorage } from '@/shared/utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  // Fail fast in runtime environments where env is missing.
  // Vite replaces import.meta.env at build time.
  console.warn('VITE_API_BASE_URL is not configured.');
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const session = authSessionStorage.read();

  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  if (session.apiKey) {
    config.headers['x-api-key'] = session.apiKey;
  }

  return config;
});
