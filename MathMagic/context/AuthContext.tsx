import React, { createContext, useContext, useEffect, useState } from "react";
import { tokenStorage } from "../lib/tokenStorage";
import api from "../lib/api";
import { API_BASE_URL } from "../lib/apiUrl";
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.warn("GoogleSignin native module not found");
}


const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);


  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await tokenStorage.getToken();
      if (token) {
        // Simple checkAuth call to backend
        const response = await api.get(`${API_BASE_URL}/auth/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setIsSignedIn(true);
      }
    } catch (error) {
      console.error("Failed to load user", error);
      await tokenStorage.removeToken();
    } finally {
      setIsLoaded(true);
    }
  };



  const loginWithToken = async (userData: any, token: string) => {
    await tokenStorage.saveToken(token);
    const userDetails = userData?.user || userData;
    setUser(userDetails);
    setIsSignedIn(true);
  };

  const backendSignOut = async () => {
    try {
       // Optional: call backend logout (to clear cookie)
       await api.post(`${API_BASE_URL}/auth/logout`);
    } catch (err) {}
    
    await tokenStorage.removeToken();
    setUser(null);
    setIsSignedIn(false);
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (err) {
      // Ignore errors if the user wasn't signed in via Google
    }
    await backendSignOut();
  };

  const getToken = async () => {
    return await tokenStorage.getToken();
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn, signOut, getToken, loginWithToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
