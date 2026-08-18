import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthMode } from '../types/auth.types';

interface AuthFormViewProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onBack: () => void;
  name: string;
  setName: (text: string) => void;
  email: string;
  setEmail: (text: string) => void;
  phone: string;
  setPhone: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  confirmPassword: string;
  setConfirmPassword: (text: string) => void;
  loading: boolean;
  focusedField: string | null;
  setFocusedField: (field: string | null) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  onSubmit: () => void;
  onGoogleAuth: () => void;
}

export const AuthFormView = ({
  mode,
  setMode,
  onBack,
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
  loading,
  focusedField,
  setFocusedField,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
  onGoogleAuth,
}: AuthFormViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-transparent px-6 pt-4 justify-between relative overflow-hidden"
      style={{ paddingBottom: Math.max(insets.bottom + 12, 32) }}
    >
      {/* Top Bar with Back Button */}
      <View className="w-full flex-row items-center justify-start mt-2 mb-4 h-10 px-1 z-20">
        <TouchableOpacity
          className="w-10 h-10 rounded-full border border-primary/10 bg-white justify-center items-center active:scale-95"
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={mode === 'register' ? '#10B981' : '#8B5CF6'} />
        </TouchableOpacity>
      </View>

      {/* Centered Square Root Logo */}
      <View className="items-center mb-6 z-20">
        <LinearGradient
          colors={mode === 'register' ? ['#10B981', '#059669'] : ['#8B5CF6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 76,
            height: 76,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: mode === 'register' ? '#10B981' : '#8B5CF6',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <Text className="text-white text-3xl font-extrabold">√x</Text>
        </LinearGradient>

        <Text className="text-text-primary text-[28px] font-extrabold tracking-tight font-sans">
          {mode === 'register' ? 'Create Account' : 'Welcome Back!'}
        </Text>
        <Text className="text-text-secondary text-xs mt-2 text-center font-sans leading-relaxed px-4">
          {mode === 'register' ? 'Join us and start learning math.' : 'Login to continue your math journey.'}
        </Text>
      </View>

      {/* Input Form Fields */}
      <View className="w-full mb-6 z-20">
        {mode === 'register' && (
          <>
            <View className="mb-3.5">
              <Text className="text-slate-700 text-xs font-bold mb-2 font-sans">Name</Text>
              <View className="relative justify-center">
                <TextInput
                  className="w-full bg-white border rounded-2xl pl-12 pr-5 py-4 text-text-primary font-sans text-sm transition-all"
                  style={{
                    borderColor: focusedField === 'name' ? '#10B981' : 'rgba(16, 185, 129, 0.1)',
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
                <View className="absolute left-4">
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                </View>
              </View>
            </View>

            <View className="mb-3.5">
              <Text className="text-slate-700 text-xs font-bold mb-2 font-sans">Phone (Optional)</Text>
              <View className="relative justify-center">
                <TextInput
                  className="w-full bg-white border rounded-2xl pl-12 pr-5 py-4 text-text-primary font-sans text-sm transition-all"
                  style={{
                    borderColor: focusedField === 'phone' ? '#10B981' : 'rgba(16, 185, 129, 0.1)',
                  }}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
                <View className="absolute left-4">
                  <Ionicons name="call-outline" size={18} color="#9CA3AF" />
                </View>
              </View>
            </View>
          </>
        )}

        <View className="mb-3.5">
          <Text className="text-slate-700 text-xs font-bold mb-2 font-sans">
            {mode === 'register' ? 'Email' : 'Email or Phone'}
          </Text>
          <View className="relative justify-center">
            <TextInput
              className="w-full bg-white border rounded-2xl pl-12 pr-5 py-4 text-text-primary font-sans text-sm transition-all"
              style={{
                borderColor:
                  focusedField === 'email'
                    ? mode === 'register'
                      ? '#10B981'
                      : '#8B5CF6'
                    : mode === 'register'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(139, 92, 246, 0.1)',
              }}
              placeholder={mode === 'register' ? 'Enter your email' : 'Enter email or phone'}
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
            <View className="absolute left-4">
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
            </View>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-slate-700 text-xs font-bold mb-2 font-sans">Password</Text>
          <View className="relative justify-center">
            <TextInput
              className="w-full bg-white border rounded-2xl pl-12 pr-14 py-4 text-text-primary font-sans text-sm transition-all"
              style={{
                borderColor:
                  focusedField === 'password'
                    ? mode === 'register'
                      ? '#10B981'
                      : '#8B5CF6'
                    : mode === 'register'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(139, 92, 246, 0.1)',
              }}
              placeholder={mode === 'register' ? 'Create a password' : 'Enter password'}
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <View className="absolute left-4">
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
            </View>
            <TouchableOpacity
              className="absolute right-4 p-2"
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {mode === 'register' && (
          <View className="mb-4">
            <Text className="text-slate-700 text-xs font-bold mb-2 font-sans">Confirm Password</Text>
            <View className="relative justify-center">
              <TextInput
                className="w-full bg-white border rounded-2xl pl-12 pr-14 py-4 text-text-primary font-sans text-sm transition-all"
                style={{
                  borderColor: focusedField === 'confirmPassword' ? '#10B981' : 'rgba(16, 185, 129, 0.1)',
                }}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
              />
              <View className="absolute left-4">
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
              </View>
              <TouchableOpacity
                className="absolute right-4 p-2"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Primary CTA Sign In/Up Button */}
        <TouchableOpacity
          onPress={onSubmit}
          disabled={loading}
          className="w-full active:scale-95 transition-all mt-2"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={mode === 'register' ? ['#10B981', '#059669'] : ['#8B5CF6', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 20,
              width: '100%',
              paddingVertical: 15,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-sans font-bold text-sm tracking-wider">
                {mode === 'register' ? 'Sign Up' : 'Login'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Switch Login/Register Toggle option */}
        <TouchableOpacity
          className="mt-4 p-2 items-center"
          onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          activeOpacity={0.7}
        >
          <Text className="text-text-secondary text-xs font-sans tracking-wide">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text className="font-bold underline" style={{ color: mode === 'login' ? '#8B5CF6' : '#10B981' }}>
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider and Google Auth option */}
      <View className="w-full mb-6 z-20">
        <View className="flex-row items-center mb-5">
          <View className="flex-grow h-[0.5px] bg-primary/20" />
          <Text className="mx-4 text-text-secondary font-sans text-[10px] uppercase tracking-widest">or</Text>
          <View className="flex-grow h-[0.5px] bg-primary/20" />
        </View>

        <TouchableOpacity
          className="w-full bg-white border border-primary/10 rounded-2xl py-4 flex-row items-center justify-center active:scale-95 shadow-sm"
          onPress={onGoogleAuth}
          disabled={loading}
          activeOpacity={0.75}
        >
          <Ionicons name="logo-google" size={16} color="#8B5CF6" />
          <Text className="text-slate-700 font-sans font-bold text-xs tracking-wider ml-3">
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legal Terms Disclosure */}
      <View className="items-center px-4 z-20">
        <Text className="text-center text-text-tertiary text-[9px] uppercase tracking-widest leading-5">
          By accessing your account, you agree to our
        </Text>
        <View className="flex-row items-center gap-1.5 mt-1">
          <TouchableOpacity onPress={() => Linking.openURL('https://www.iqvenus.com/terms')} activeOpacity={0.7}>
            <Text className="text-primary text-[9px] uppercase tracking-widest font-bold underline">
              Terms of Service
            </Text>
          </TouchableOpacity>
          <Text className="text-text-tertiary text-[9px]">&</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.iqvenus.com/privacy')} activeOpacity={0.7}>
            <Text className="text-primary text-[9px] uppercase tracking-widest font-bold underline">
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AuthFormView;
