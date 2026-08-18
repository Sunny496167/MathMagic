import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants';

export const tokenStorage = {
  async saveTokens(tokens: { accessToken: string; refreshToken?: string }) {
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.LEGACY_TOKEN, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.LEGACY_TOKEN, tokens.accessToken);
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
  },

  async saveToken(token: string) {
    await this.saveTokens({ accessToken: token });
  },

  async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return (
        localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.LEGACY_TOKEN)
      );
    }
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) return token;
    return await SecureStore.getItemAsync(STORAGE_KEYS.LEGACY_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async getToken(): Promise<string | null> {
    return await this.getAccessToken();
  },

  async removeToken() {
    await this.clearTokens();
  },

  async clearTokens() {
    if (Platform.OS === 'web') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN);
      return;
    }
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN).catch(() => {});
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN).catch(() => {});
    await SecureStore.deleteItemAsync(STORAGE_KEYS.LEGACY_TOKEN).catch(() => {});
  },
};
