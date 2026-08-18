import { apiClient } from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import { LoginCredentials, RegisterCredentials } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials) {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
    return data.data || data;
  },

  async register(credentials: RegisterCredentials) {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.REGISTER, {
      name: credentials.name.trim(),
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      phone: credentials.phone?.trim() || undefined,
      role: credentials.role || 'customer',
      referredByCode: credentials.referredByCode?.trim() || undefined,
    });
    return data.data || data;
  },

  async googleAuth(idToken: string, profile?: any) {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.GOOGLE, {
      idToken,
      profile,
    });
    return data.data || data;
  },

  async logout(refreshToken?: string | null) {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {
      refreshToken,
    });
    return data;
  },

  async getMe() {
    const { data } = await apiClient.get(ENDPOINTS.AUTH.ME);
    return data.data || data;
  },
};
