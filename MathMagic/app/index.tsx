import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { View, ActivityIndicator, Text, Platform } from "react-native";

export default function RootIndex() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0B0B", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", letterSpacing: 3, marginBottom: 20 }}>
          IQVenus
        </Text>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
}
