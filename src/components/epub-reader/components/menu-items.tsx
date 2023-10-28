import { Button, styled, YStack } from "tamagui";

import { HEADER_HEIGHT } from "../../../hooks/use-header-height";

export const MenuContainer = styled(YStack, {
  zIndex: 9999,
  h: 300,
  w: "100%",
  px: "$4",
  py: "$4",
  bg: "$background",
  pos: "absolute",
  space: "$2",
  animation: "100ms",
  enterStyle: {
    opacity: 0,
  },
  exitStyle: {
    opacity: 0,
    y: -300 + -HEADER_HEIGHT,
  },
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
