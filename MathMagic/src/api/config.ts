import { Platform } from 'react-native';

export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    // Android Emulator -> 10.0.2.2, iOS Simulator -> localhost, Device -> local IP
    const HOST = Platform.OS === 'android' ? '192.168.31.201' : '192.168.31.201';
    return `http://${HOST}:5000/api/v1`;
  }

  return 'https://iqvenus-backend.onrender.com/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();
