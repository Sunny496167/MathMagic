import { Stack } from "expo-router";

export default function WorkspaceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="vendor" />
      <Stack.Screen name="artisan" />
      <Stack.Screen name="franchise" />
      <Stack.Screen name="client" />
    </Stack>
  );
}
