import { StyleSheet, View } from "react-native";

import Completion from "@/components/header/completion";
import GoldCount from "@/components/header/gold-count";
import MenuButton from "@/components/header/menu-button";

interface HeaderProps {
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ setIsMenuOpen }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <MenuButton setIsMenuOpen={setIsMenuOpen} />
        <GoldCount />
      </View>
      <View style={styles.right}>
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
