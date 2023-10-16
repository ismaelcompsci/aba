import { Button, styled } from "tamagui";

export const IconButton = styled(Button, {
  borderWidth: "0",
  backgroundColor: "$backgroundTransparent",
  pressStyle: {
    backgroundColor: "$backgroundTransparent",
    borderWidth: "0",
    opacity: 0.5,
  },
  paddingHorizontal: "$2",
});
