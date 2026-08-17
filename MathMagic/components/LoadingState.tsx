import { View, Text, ActivityIndicator } from "react-native";

interface LoadingStateProps {
  message?: string;
  color?: string;
}

const LoadingState = ({ message = "Loading...", color = "#D4AF37" }: LoadingStateProps) => {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size={"large"} color={color} />
      <Text className="text-text-secondary mt-4">{message}</Text>
    </View>
  );
};

export default LoadingState;
