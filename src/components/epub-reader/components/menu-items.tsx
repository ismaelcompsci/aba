import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { Button, styled } from "tamagui";

export const MenuContainer = styled(Animated.View, {
  zIndex: 99999,
  h: 300,
  w: "100%",
  px: "$5",
  py: "$4",
  bg: "$background",
  pos: "absolute",
  space: "$2",
  entering: FadeInUp,
  exiting: FadeOutUp,
});

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
