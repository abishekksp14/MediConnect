import axios from 'axios';

// Use a relative URL so requests go through the Vite dev proxy (same origin = no CORS).
// Vite proxies /api/* → http://localhost:5000/api/* on the server side.
// VITE_API_URL can override this in production (e.g. https://your-server.com/api).
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for sending/receiving HTTP-only cookies
});

// Attach auth token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

