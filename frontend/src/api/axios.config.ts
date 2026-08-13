import axios, { type InternalAxiosRequestConfig } from 'axios';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Resolve the backend API base URL.
 *
 * Priority:
 * 1. VITE_API_URL (explicit override)
 * 2. localhost/127.0.0.1 → `/api/v1` (handled by Vite dev proxy)
 * 3. Any other host (LAN IP, domain) → `http://<same-host>:3000/api/v1`
 *
 * This makes the app work on ANY LAN IP without editing .env.
 */
const resolveBaseUrl = (): string => {
  const explicit = import.meta.env.VITE_API_URL as string | undefined;
  if (explicit && explicit.trim()) return explicit.trim();

  if (typeof window === 'undefined') return '/api/v1';

  const { hostname, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return '/api/v1';
  }

  return `${protocol}//${hostname}:3000/api/v1`;
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRequest = request?.url?.startsWith('/auth/');

    if (error.response?.status !== 401 || request?._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return Promise.reject(error);

    request._retry = true;
    refreshPromise ??= axios
      .post<{ accessToken: string }>(`${api.defaults.baseURL}/auth/refresh`, { refreshToken }, { withCredentials: true })
      .then(({ data }) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        return data.accessToken;
      })
      .finally(() => { refreshPromise = null; });

    try {
      const newToken = await refreshPromise;
      request.headers.Authorization = `Bearer ${newToken}`;
      return api(request);
    } catch (refreshError) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  },
);

export default api;
