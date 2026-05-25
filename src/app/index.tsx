import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { resetGameStorage } from "@/lib/store/game";
import { resetLevelStorage } from "@/lib/store/level";
import { theme } from "@/lib/theme";

export default function Index() {
  function handleReset() {
    resetGameStorage();
    resetLevelStorage();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.text}>Welcome to game</Text>
        <TouchableOpacity>
          <Link href="/game" style={styles.link}>
            Go to game
          </Link>
        </TouchableOpacity>
        <Pressable onPress={handleReset}>
          <Text>Reset storage</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    backgroundColor: theme.colors.background,
  },
  text: {
    color: theme.colors.foreground,
    fontSize: 30,
  },
  link: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: 700,
  },
});
