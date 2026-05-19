import { StyleSheet, View } from "react-native";

import Completion from "@/components/header/completion";
import GoldCount from "@/components/header/gold-count";
import MenuButton from "@/components/header/menu-button";

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <MenuButton />
        <GoldCount />
      </View>
      <View style={styles.right}>
        <Completion />
        <Completion />
        <Completion />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBlockStart: 10,
    paddingInlineEnd: 5,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  right: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginInlineEnd: 15,
  },
});
