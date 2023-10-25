import { Stack, styled, YStack } from "tamagui";

import {
  HEADER_HEIGHT,
  HEADER_HEIGHT_TAB_BAR,
} from "../hooks/use-header-height";

export const ScreenCenter = styled(Stack, {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "$background",
  paddingBottom: HEADER_HEIGHT, // height of header
});

export const ScreenCenterWithTabBar = styled(ScreenCenter, {
  paddingBottom: HEADER_HEIGHT_TAB_BAR,
});

export const FullScreen = styled(YStack, {
  width: "100%",
  height: "100%",
  backgroundColor: "$background",
});
