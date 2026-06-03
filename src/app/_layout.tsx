import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          statusBarHidden: true,
          navigationBarHidden: true,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="game/index" />
        <Stack.Screen name="game/[level]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
