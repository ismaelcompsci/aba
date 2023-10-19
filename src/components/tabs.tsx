import { styled, ToggleGroup, XStack } from "tamagui";

export const TabContainer = styled(XStack, {
  alignItems: "center",
  paddingVertical: "$2",
  paddingHorizontal: "$3",
  justifyContent: "center",
  width: "100%",
  backgroundColor: "$background",
});

export const TabGroup = styled(ToggleGroup, {
  size: "$5",
  width: "100%",
  height: "$4",
  orientation: "horizontal",
  type: "single",
});
