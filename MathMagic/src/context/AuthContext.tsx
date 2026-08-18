import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenStorage } from '../services/tokenStorage';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { UserProfile } from '../types';

let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch {
  // Native module not loaded in standard Expo Go; handled gracefully
}

interface AuthContextType {
  user: UserProfile | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  loginWithToken: (authPayload: any, accessToken: string, refreshToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        const response = await apiClient.get(ENDPOINTS.AUTH.ME);
        const userData = response.data?.data?.user || response.data?.user || response.data;

        if (userData && (userData._id || userData.email)) {
          setUser(userData);
          setIsSignedIn(true);
        } else {
          throw new Error('Invalid user profile');
        }
      } else {
        setUser(null);
        setIsSignedIn(false);
      }
    } catch (error) {
      console.warn('Failed to restore session:', error instanceof Error ? error.message : error);
      await tokenStorage.clearTokens();
      setUser(null);
      setIsSignedIn(false);
    } finally {
      setIsLoaded(true);
    }
  };

  const loginWithToken = async (
    authPayload: any,
    accessToken: string,
    refreshToken?: string
  ) => {
    await tokenStorage.saveTokens({
      accessToken,
      refreshToken: refreshToken || authPayload?.refreshToken,
    });

    const userDetails = authPayload?.data?.user || authPayload?.user || authPayload;

    setUser(userDetails);
    setIsSignedIn(true);
  };

  const backendSignOut = async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
    } catch {
      // Continue client cleanup even if network request fails
    }

    await tokenStorage.clearTokens();
    setUser(null);
    setIsSignedIn(false);
  };

  const signOut = async () => {
    try {
      if (GoogleSignin?.signOut) {
        await GoogleSignin.signOut();
      }
    } catch {
      // Ignore error if not signed in via Google
    }
    await backendSignOut();
  };

  const getToken = async () => {
    return await tokenStorage.getAccessToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn,
        signOut,
        getToken,
        loginWithToken,
        setUser,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
