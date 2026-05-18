import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/lib/theme";

import Board from "@/components/board";
import Header from "@/components/header";

export default function Game() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header />
        <Board />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: theme.colors.background,
  },
});
