import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../services/authService';
import { AuthMode, AuthViewMode } from '../types/auth.types';

let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  if (GoogleSignin) {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }
} catch {
  // GoogleSignin native module not found in standard Expo Go
}

export const useAuthScreen = () => {
  const [viewMode, setViewMode] = useState<AuthViewMode>('welcome');
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referredByCode, setReferredByCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { loginWithToken } = useAuth();

  const handleGoogleAuth = async () => {
    if (!GoogleSignin) {
      Alert.alert(
        'Unsupported Environment',
        'Google Sign-In requires a development build. Please sign in using your Email & Password instead.'
      );
      return;
    }

    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken || response.idToken;
      const user = response.data?.user || response.user;

      if (!idToken) {
        throw new Error('No ID token returned from Google');
      }

      const authData = await authService.googleAuth(idToken, user);
      const accessToken = authData.accessToken || authData.token;
      const refreshToken = authData.refreshToken;

      await loginWithToken(authData, accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      const isCancel =
        error.code === 'SIGN_IN_CANCELLED' ||
        error.message?.includes('cancel') ||
        error.code === '12501' ||
        error.code === '-5';

      if (!isCancel) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.message ||
          error.message ||
          'Could not sign in with Google.';
        Alert.alert('Authentication Failed', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'register' && !name)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      let authData;
      if (mode === 'login') {
        authData = await authService.login({ email, password });
      } else {
        authData = await authService.register({
          name,
          email,
          password,
          phone,
          referredByCode,
        });
      }

      const accessToken = authData.accessToken || authData.token;
      const refreshToken = authData.refreshToken;

      await loginWithToken(authData, accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        error.message ||
        'Authentication failed. Please try again.';
      Alert.alert('Authentication Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    viewMode,
    setViewMode,
    mode,
    setMode,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    referredByCode,
    setReferredByCode,
    loading,
    focusedField,
    setFocusedField,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleGoogleAuth,
    handleSubmit,
  };
};
