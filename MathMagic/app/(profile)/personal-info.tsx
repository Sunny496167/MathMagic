import { SafeScreen } from '@/src/components/common/SafeScreen';
import { useAuth } from '@/src/context/AuthContext';
import { useApi } from '@/src/api/client';
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PersonalInfoScreen() {
  const { user, setUser } = useAuth();
  const api = useApi();
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState(user?.name || "");
  const [imageUri, setImageUri] = useState<string | null>(user?.imageUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Email is typically read-only or requires a special verification flow
  const email = user?.email || "";

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Invalid Input", "Name cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);
      
      const formData = new FormData();
      formData.append("name", name);

      if (imageUri && imageUri !== user?.imageUrl) {
        const filename = imageUri.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      const { data } = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setUser(data.user);
      Alert.alert("Success", "Personal information updated successfully.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error("Failed to update profile", error);
      Alert.alert("Error", error?.response?.data?.error || "Could not update your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* HEADER */}
        <View className="px-6 pb-5 border-b border-surface flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-2xl font-bold">Personal Info</Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 24, paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* PROFILE ICON */}
          <View className="items-center mb-10 mt-6">
            <View className="relative shadow-2xl">
              <TouchableOpacity 
                className="w-28 h-28 rounded-full border-2 border-primary/50 items-center justify-center bg-surface overflow-hidden"
                activeOpacity={0.8}
                onPress={pickImage}
              >
                <Image 
                  source={imageUri ? { uri: imageUri } : require("@/assets/images/default_avatar.jpg")} 
                  style={{ width: "100%", height: "100%" }} 
                  contentFit="cover" 
                />
              </TouchableOpacity>
              
              {/* Floating Camera Badge */}
              <TouchableOpacity
                className="absolute bottom-0 right-0 bg-primary w-9 h-9 rounded-full items-center justify-center border-2 border-[#0A0A0A] shadow-xl"
                activeOpacity={0.8}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={16} color="#000000" />
              </TouchableOpacity>
            </View>
            <Text className="text-text-secondary text-xs uppercase tracking-[0.15em] mt-4">Update Photo</Text>
          </View>

          {/* FORM */}
          <View className="gap-6">
            <View>
              <Text className="text-text-secondary font-sans text-xs uppercase tracking-[0.15em] mb-2 ml-1">
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full bg-surface-dark border ${
                  isFocused ? "border-primary" : "border-surface-light"
                } rounded-xl px-4 py-4 text-text-primary font-sans text-base`}
                placeholder="Enter your name"
                placeholderTextColor="#7D7D7D"
              />
            </View>

            <View>
              <Text className="text-text-secondary font-sans text-xs uppercase tracking-widest mb-2 ml-1">
                Email Address
              </Text>
              <View className="w-full bg-surface-dark/50 border border-surface-light rounded-xl px-4 py-4 opacity-70 flex-row items-center justify-between">
                <Text className="text-text-secondary font-sans text-base">
                  {email || "Not Provided"}
                </Text>
                <Ionicons name="lock-closed" size={16} color="#7D7D7D" />
              </View>
              <Text className="text-text-tertiary text-[10px] mt-2 ml-1">
                Email address cannot be changed directly for security reasons.
              </Text>
            </View>
          </View>
        </ScrollView>
        
        {/* BOTTOM ACTION */}
        <View 
          className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-surface px-6 py-5"
          style={{ paddingBottom: Math.max(insets.bottom, 24) + 10 }}
        >
            <TouchableOpacity
              className="w-full h-12 bg-primary rounded-full items-center justify-center shadow-lg shadow-black/50"
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text className="text-background font-sans font-bold text-sm uppercase tracking-widest">
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
