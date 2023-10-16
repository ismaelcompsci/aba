import { styled, XStack, YStack } from "tamagui";

export const HeaderSafeArea = styled(YStack, {
  name: "HeaderSafeArea",
  backgroundColor: "$background",
  bbw: ".2",
});

export const HeaderFrame = styled(XStack, {
  w: "100%",
  h: "100%",
  alignItems: "center",
  paddingHorizontal: "$4",
});

export const HeaderLeft = styled(XStack, {
  flex: 1,
});
export const HeaderRight = styled(XStack, {
  flex: 1,
  justifyContent: "flex-end",
  space: "$2",
});
