import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView, Linking, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import SafeScreen from "@/components/SafeScreen";
import { useState } from "react";
import { useApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  if (GoogleSignin) {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });
  }
} catch (e) {
  console.warn("GoogleSignin native module not found");
}
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

const AuthScreen = () => {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<"welcome" | "auth">("welcome");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referredByCode, setReferredByCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const api = useApi();
  const { loginWithToken } = useAuth();
  
  const handleGoogleAuth = async () => {
    if (!GoogleSignin) {
      Alert.alert(
        "Unsupported Environment",
        "Google Sign-In is not supported in the standard Expo Go app. Please sign in using your Email & Password instead, or run a Development Build."
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
        throw new Error("No ID token returned from Google");
      }

      console.log("[Google Auth] Signed in, calling backend...");

      const { data } = await api.post("/auth/google", {
        idToken,
        profile: user
      });

      await loginWithToken(data, data.token);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("[Google Auth] Error:", error);
      const isCancel = 
        error.code === 'SIGN_IN_CANCELLED' || 
        error.message?.includes("cancel") || 
        error.code === '12501' || // 12501 is SIGN_IN_CANCELLED on Android
        error.code === '-5';      // iOS canceled

      if (!isCancel) {
        Alert.alert(
          "Authentication Failed", 
          error.response?.data?.message || error.message || "Could not sign in with Google."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password || (mode === "register" && !name)) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" 
        ? { email, password } 
        : { name, email, password, role: 'customer', referredByCode };
      
      const { data } = await api.post(endpoint, payload);
      await loginWithToken(data, data.token);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Auth error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {viewMode === "welcome" ? (
            // ================= 1. WELCOME SCREEN =================
            <View className="flex-1 bg-background px-6 pt-2 pb-10 justify-between">
              
              {/* Top Bar with Logo & Moon icon */}
              <View className="w-full flex-row justify-between items-center px-1">
                {/* Logo Square Root box */}
                <LinearGradient
                  colors={["#8B5CF6", "#6366F1"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                >
                  <Text className="text-white text-base font-bold">√x</Text>
                </LinearGradient>
                {/* Moon Icon */}
                <TouchableOpacity className="w-10 h-10 bg-slate-50 border border-primary/5 rounded-full justify-center items-center">
                  <Ionicons name="moon-outline" size={18} color="#8B5CF6" />
                </TouchableOpacity>
              </View>

              {/* Title & Tagline */}
              <View className="items-center">
                <Text className="text-text-primary text-[28px] font-extrabold text-center tracking-tight font-sans">
                  Welcome to
                </Text>
                <Text className="text-primary text-[32px] font-extrabold text-center tracking-tight font-sans">
                  Math Path
                </Text>
                <Text className="text-text-secondary text-xs mt-2 text-center px-4 font-sans leading-relaxed">
                  Learn math in a simple, fun and effective way.
                </Text>
              </View>

              {/* Hero Image Container with floating mathematical decorations */}
              <View className="w-full max-w-[310px] self-center my-4 items-center justify-center relative">
                {/* Math capsules & icons */}
                <View 
                  className="absolute left-[-16px] top-6 bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1.5 rounded-full shadow-sm z-10"
                  style={{ transform: [{ rotate: "-10deg" }] }}
                >
                  <Text className="text-[#2563EB] text-xs font-extrabold font-sans">2+3=5</Text>
                </View>

                <View 
                  className="absolute left-[-8px] bottom-10 bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-full shadow-sm z-10"
                  style={{ transform: [{ rotate: "10deg" }] }}
                >
                  <Text className="text-[#059669] text-xs font-extrabold font-sans">7-2=5</Text>
                </View>

                <View className="absolute right-[-10px] top-4 bg-[#FFFBEB] border border-[#FDE68A] w-9 h-9 rounded-full items-center justify-center shadow-sm z-10">
                  <Ionicons name="bulb" size={18} color="#D97706" />
                </View>

                <View className="absolute right-[-8px] bottom-8 bg-[#FFF7ED] border border-[#FFEDD5] w-9 h-9 rounded-full items-center justify-center shadow-sm z-10">
                  <Ionicons name="triangle" size={18} color="#EA580C" />
                </View>

                {/* Main Illustration frame */}
                <View className="w-full h-[220px] bg-white border border-primary/10 rounded-[32px] p-2 shadow-sm overflow-hidden">
                  <Image
                    source={require("../../assets/images/student_learning.jpg")}
                    style={{ width: "100%", height: "100%", borderRadius: 24 }}
                    contentFit="cover"
                    transition={300}
                  />
                </View>
              </View>

              {/* White Card Container for Features List */}
              <View 
                className="w-full bg-white border border-primary/5 rounded-[32px] p-5 shadow-sm items-center"
                style={{
                  shadowColor: "#8B5CF6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.05,
                  shadowRadius: 16,
                  elevation: 3,
                }}
              >
                {/* List of 3 items */}
                <View className="w-full mb-6">
                  {[
                    { title: "Learn Step by Step", desc: "Easy lessons from basic to advanced.", bg: "bg-[#F3E8FF]", border: "border-[#E9D5FF]", color: "#7C3AED", icon: "book" },
                    { title: "Play & Learn", desc: "Fun games to improve your skills.", bg: "bg-[#E8F8F0]", border: "border-[#D1F2E1]", color: "#10B981", icon: "game-controller" },
                    { title: "Test & Improve", desc: "Quizzes to track and boost your learning.", bg: "bg-[#FEF3C7]", border: "border-[#FEEB9F]", color: "#D97706", icon: "trophy" }
                  ].map((item, idx) => (
                    <View 
                      key={item.title} 
                      className={`flex-row items-center justify-between bg-slate-50/50 border border-slate-100/60 p-2.5 rounded-2xl ${idx !== 2 ? "mb-3" : ""}`}
                    >
                      <View className="flex-row items-center flex-1 pr-2">
                        <View className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} items-center justify-center mr-3.5 shadow-sm`}>
                          <Ionicons name={item.icon as any} size={18} color={item.color} />
                        </View>
                        <View className="flex-1">
                          <Text className="text-slate-800 text-sm font-extrabold font-sans">{item.title}</Text>
                          <Text className="text-slate-500 text-[10px] mt-0.5 font-medium">{item.desc}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward-outline" size={14} color="#94A3B8" />
                    </View>
                  ))}
                </View>

                {/* Let's Start CTA Button */}
                <TouchableOpacity
                  onPress={() => {
                    setMode("register");
                    setViewMode("auth");
                  }}
                  className="w-full active:scale-95 transition-all"
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#8B5CF6", "#6D28D9"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 20,
                      width: "100%",
                      paddingVertical: 15,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text className="text-white font-sans font-bold text-sm tracking-wider">
                      Let's Start →
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Login link */}
                <TouchableOpacity
                  onPress={() => {
                    setMode("login");
                    setViewMode("auth");
                  }}
                  className="mt-3.5 py-1"
                  activeOpacity={0.7}
                >
                  <Text className="text-text-secondary font-sans text-xs tracking-wider">
                    Already have an account? <Text className="text-primary font-bold underline">Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          ) : (
            // ================= 2. REGISTER / LOGIN FORM SCREEN =================
            <View 
              className="flex-1 bg-background px-6 pt-6 justify-between"
              style={{ paddingBottom: Math.max(insets.bottom + 12, 32) }}
            >
              {/* Top Bar with circular Back Button */}
              <View className="w-full flex-row items-center justify-between mt-4 mb-4 relative h-10">
                <TouchableOpacity
                  className="w-10 h-10 rounded-full border border-primary/20 bg-white justify-center items-center active:scale-95 z-10"
                  onPress={() => setViewMode("welcome")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={20} color="#8B5CF6" />
                </TouchableOpacity>
              </View>

              {/* Operator Badge Logo */}
              <View className="items-center mb-2">
                <View className="w-16 h-16 rounded-[20px] bg-primary items-center justify-center mb-4 shadow-sm">
                  <View className="flex-row flex-wrap w-8 h-8 items-center justify-center">
                    <Text className="text-white text-base font-bold w-4 text-center">+</Text>
                    <Text className="text-white text-base font-bold w-4 text-center">-</Text>
                    <Text className="text-white text-base font-bold w-4 text-center">×</Text>
                    <Text className="text-white text-base font-bold w-4 text-center">÷</Text>
                  </View>
                </View>

                <Text className="text-text-primary text-3xl font-bold tracking-wider">
                  {mode === "register" ? "Create Account" : "Welcome Back!"}
                </Text>
                <Text className="text-text-secondary font-sans text-xs mt-1.5 text-center">
                  {mode === "register" ? "Join us and start learning math." : "Login to continue your math journey."}
                </Text>
              </View>

              {/* Input Form Fields */}
              <View className="w-full mb-6 mt-4">
                {mode === "register" && (
                  <>
                    <View className="mb-3 relative justify-center">
                      <TextInput
                        className={`w-full bg-white border rounded-2xl pl-12 pr-5 py-4 text-text-primary font-sans text-sm transition-all ${
                          focusedField === "name" ? "border-primary" : "border-primary/10"
                        }`}
                        placeholder="Full Name"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <View className="absolute left-4">
                        <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                      </View>
                    </View>

                    <View className="mb-3 relative justify-center">
                      <TextInput
                        className={`w-full bg-white border rounded-2xl pl-12 pr-5 py-4 text-text-primary font-sans text-sm transition-all ${
                          focusedField === "phone" ? "border-primary" : "border-primary/10"
                        }`}
                        placeholder="Phone (Optional)"
                        placeholderTextColor="#9CA3AF"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <View className="absolute left-4">
                        <Ionicons name="call-outline" size={18} color="#9CA3AF" />
                      </View>
                    </View>
                  </>
                )}

                <View className="mb-3 relative justify-center">
                  <TextInput
                    className={`w-full bg-white border rounded-2xl pl-12 pr-5 py-4 text-text-primary font-sans text-sm transition-all ${
                      focusedField === "email" ? "border-primary" : "border-primary/10"
                    }`}
                    placeholder="Email Address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <View className="absolute left-4">
                    <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
                  </View>
                </View>

                <View className="mb-3 relative justify-center">
                  <TextInput
                    className={`w-full bg-white border rounded-2xl pl-12 pr-14 py-4 text-text-primary font-sans text-sm transition-all ${
                      focusedField === "password" ? "border-primary" : "border-primary/10"
                    }`}
                    placeholder={mode === "register" ? "Create Password" : "Password"}
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField("password")}
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
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                {mode === "register" && (
                  <View className="mb-4 relative justify-center">
                    <TextInput
                      className={`w-full bg-white border rounded-2xl pl-12 pr-14 py-4 text-text-primary font-sans text-sm transition-all ${
                        focusedField === "confirmPassword" ? "border-primary" : "border-primary/10"
                      }`}
                      placeholder="Confirm Password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      onFocus={() => setFocusedField("confirmPassword")}
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
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Primary CTA Sign In/Up Button */}
                <TouchableOpacity
                  className={`w-full rounded-2xl py-4 items-center mt-3 active:scale-95 transition-all shadow-sm ${
                    mode === "register" ? "bg-[#10B981]" : "bg-primary"
                  }`}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-sans font-bold text-sm tracking-wider">
                      {mode === "register" ? "Sign Up" : "Login"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Switch Login/Register Toggle option */}
                <TouchableOpacity 
                  className="mt-4 p-2 items-center"
                  onPress={() => {
                    setMode(mode === "login" ? "register" : "login");
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-text-secondary text-xs font-sans tracking-wide">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <Text className="text-primary font-bold">{mode === "login" ? "Sign Up" : "Login"}</Text>
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Divider and Google Auth option */}
              <View className="w-full mb-8">
                <View className="flex-row items-center mb-6">
                  <View className="flex-grow h-[0.5px] bg-primary/20" />
                  <Text className="mx-4 text-text-secondary font-sans text-[10px] uppercase tracking-widest">or</Text>
                  <View className="flex-grow h-[0.5px] bg-primary/20" />
                </View>

                <TouchableOpacity
                  className="w-full bg-white border border-primary/20 rounded-2xl py-4 flex-row items-center justify-center active:scale-95"
                  onPress={handleGoogleAuth}
                  disabled={loading}
                  activeOpacity={0.75}
                >
                  <Ionicons name="logo-google" size={16} color="#8B5CF6" />
                  <Text className="text-text-primary font-sans font-bold text-xs tracking-wider ml-3">
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Legal Terms Disclosure */}
              <View className="items-center px-4">
                <Text className="text-center text-text-tertiary text-[9px] uppercase tracking-widest leading-5">
                  By accessing your account, you agree to our
                </Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <TouchableOpacity
                    onPress={() => Linking.openURL('https://www.iqvenus.com/terms')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-primary text-[9px] uppercase tracking-widest font-bold underline">
                      Terms of Service
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-text-tertiary text-[9px]">&</Text>
                  <TouchableOpacity
                    onPress={() => Linking.openURL('https://www.iqvenus.com/privacy')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-primary text-[9px] uppercase tracking-widest font-bold underline">
                      Privacy Policy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default AuthScreen;
