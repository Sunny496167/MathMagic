import { Platform } from "react-native";

// iOS Simulator -> localhost, Android Emulator -> 10.0.2.2
// IMPORTANT: For physical devices, you MUST use your machine's local IP address
// (e.g., 192.168.1.XX) in an .env file as EXPO_PUBLIC_API_URL
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    // Local development configuration
    const HOST = Platform.OS === "android" ? "192.168.31.201" : "192.168.31.201";
    return `http://${HOST}:5000/api`;
  } else {
    // Production configuration (deployed backend)
    return "https://iqvenus-backend.onrender.com/api";
  }
};

export const API_BASE_URL = getApiBaseUrl();

