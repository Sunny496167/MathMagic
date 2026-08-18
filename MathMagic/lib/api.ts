import { tokenStorage } from "./tokenStorage";
import axios from "axios";
import { API_BASE_URL } from "./apiUrl";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Install the auth interceptor ONCE at module level (not inside useEffect).
// This guarantees every request — including those fired immediately on mount
// by React Query — will always carry the latest token.
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Keep a simple hook for components that need the api instance
export const useApi = () => api;

export default api;
