import { Platform } from 'react-native';

export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    // Web environment: connect via localhost
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api/v1';
    }

    // Android Emulator -> 10.0.2.2, Physical device / iOS -> local Wi-Fi IP
    const HOST = '192.168.31.201';
    return `http://${HOST}:5000/api/v1`;
  }

  return 'https://mathmagic-zm70.onrender.com/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

