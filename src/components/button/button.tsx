import { Button, styled, View } from "tamagui";

export const IconButton = styled(Button, {
  borderWidth: 0,
  backgroundColor: "$backgroundTransparent",
  pressStyle: {
    backgroundColor: "$backgroundTransparent",
    borderWidth: 0,
    opacity: 0.5,
  },
  paddingHorizontal: "$2",
});

export const ClearIconButton = styled(View, {
  padding: "$2",
  borderWidth: 0,
  pressStyle: {
    opacity: 0.5,
  },
});
