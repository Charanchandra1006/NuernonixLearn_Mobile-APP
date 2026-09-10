import axios from 'axios';

// Replace with your local machine's IP address if running on physical device
// For Android Emulator, 10.0.2.2 points to host's localhost
const BASE_URL = 'http://10.0.2.2:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

import { useAuthStore } from '../store/authStore';

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
