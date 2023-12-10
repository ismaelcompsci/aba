import Animated from "react-native-reanimated";
import { Button, styled } from "tamagui";

export const MenuContainer = styled(Animated.View, {});

export const ThemeButton = styled(Button, {
  br: 100,
  px: 12,
  py: 0,
  ai: "center",
  jc: "center",
  bordered: true,
});

export const XGroupButton = styled(Button, {
  size: "$4",
  alignSelf: "center",
});
