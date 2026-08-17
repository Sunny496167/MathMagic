import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function OAuthCallbackScreen() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/(tabs)');
    } else {
      // Fallback: If not signed in after 3 seconds, redirect back to login
      const timer = setTimeout(() => {
        router.replace('/(auth)');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, isLoaded]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B0B', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#D4AF37" />
    </View>
  );
}
