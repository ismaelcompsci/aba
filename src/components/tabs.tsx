import { Group, styled, XStack } from "tamagui";

export const TabContainer = styled(XStack, {
  alignItems: "center",
  paddingVertical: "$2",
  paddingHorizontal: "$3",
  justifyContent: "center",
  width: "100%",
});

export const TabGroup = styled(Group, {
  size: "$5",
  width: "100%",
  height: "$4",
  orientation: "horizontal",
  // type: "single",
});
