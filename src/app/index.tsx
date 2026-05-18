import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/lib/theme";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.text}>Welcome to game</Text>
        <Link href="/game" style={styles.link}>
          Go to game
        </Link>
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
