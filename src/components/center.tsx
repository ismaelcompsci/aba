import { Stack, styled } from "tamagui";

export const ScreenCenter = styled(Stack, {
  width: "100%",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "$background",
  paddingBottom: 94, // height of header
});
