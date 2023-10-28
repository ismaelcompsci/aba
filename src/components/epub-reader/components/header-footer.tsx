import { styled, XStack } from "tamagui";

import { HEADER_HEIGHT } from "../../../hooks/use-header-height";

export const Header = styled(XStack, {
  h: HEADER_HEIGHT,
  bg: "$background",
  pos: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: "$5",
});

export const Footer = styled(XStack, {
  h: HEADER_HEIGHT,
  bg: "$background",
  pos: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: "$5",
});
