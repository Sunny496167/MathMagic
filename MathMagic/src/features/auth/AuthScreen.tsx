import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import SafeScreen from '../../components/common/SafeScreen';
import { BackgroundDecorations } from './components/BackgroundDecorations';
import { WelcomeView } from './components/WelcomeView';
import { AuthFormView } from './components/AuthFormView';
import { useAuthScreen } from './hooks/useAuthScreen';

export const AuthScreen = () => {
  const {
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
    loading,
    focusedField,
    setFocusedField,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleGoogleAuth,
    handleSubmit,
  } = useAuthScreen();

  return (
    <SafeScreen>
      <BackgroundDecorations accent={mode === 'register' && viewMode === 'auth' ? 'green' : 'purple'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {viewMode === 'welcome' ? (
            <WelcomeView
              onStart={() => {
                setMode('register');
                setViewMode('auth');
              }}
              onLogin={() => {
                setMode('login');
                setViewMode('auth');
              }}
            />
          ) : (
            <AuthFormView
              mode={mode}
              setMode={setMode}
              onBack={() => setViewMode('welcome')}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              loading={loading}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              onSubmit={handleSubmit}
              onGoogleAuth={handleGoogleAuth}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default AuthScreen;
