import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
} from "react-native-reanimated";
import { styled } from "tamagui";

import { HEADER_HEIGHT } from "../../../hooks/use-header-height";

export const Header = styled(Animated.View, {
  h: HEADER_HEIGHT,
  w: "100%",
  bg: "$background",
  pos: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  entering: FadeInUp,
  exiting: FadeOutUp,
});

export const Footer = styled(Animated.View, {
  h: HEADER_HEIGHT,
  w: "100%",
  bg: "$background",
  pos: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  entering: FadeInDown,
  exiting: FadeOutDown,
});
