import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import api from '@/api/axios.config';
import type { AuthResponse, AuthUser, LoginPayload } from '@/types/auth.types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const savedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

const initialState: AuthState = {
  user: null,
  accessToken: savedAccessToken,
  isAuthenticated: Boolean(savedAccessToken),
  isLoading: false,
};

const persistSession = (response: AuthResponse) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
  if (response.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
};

export const login = createAsyncThunk<AuthResponse, LoginPayload>('auth/login', async (payload) => {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  persistSession(data);
  return data;
});

export const refreshSession = createAsyncThunk<AuthResponse, void>('auth/refreshSession', async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('Missing refresh token');
  const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
  persistSession(data);
  return data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser>) => { state.user = action.payload; },
    setSession: (state, action: PayloadAction<AuthResponse>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      persistSession(action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state) => { state.isLoading = false; })
      .addCase(refreshSession.pending, (state) => { state.isLoading = true; })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload.user; state.accessToken = action.payload.accessToken; state.isAuthenticated = true;
      })
      .addCase(refreshSession.rejected, (state) => { state.isLoading = false; state.isAuthenticated = false; state.accessToken = null; });
  },
});

export const { logout, setSession, setUser } = authSlice.actions;
export default authSlice.reducer;
