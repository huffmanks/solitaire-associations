import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarHidden: true,
        navigationBarHidden: true,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="game" />
    </Stack>
  );
}
