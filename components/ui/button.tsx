import { Stack, styled, Text } from "@tamagui/core";
import { StackProps } from "tamagui";

const ButtonFrame = styled(Stack, {
  name: "Button",
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "center",
  backgroundColor: "$backgroundTransparent",
  borderColor: "$gray10Dark",
  pressStyle: {
    borderWidth: 0.5,
    borderColor: "$blue10Dark",
  },
  borderRadius: "$md",

  variants: {
    size: {
      sm: {
        height: "$sm", // 46
        paddingHorizontal: "$space.2",
      },
      md: {
        height: "$md",
        paddingHorizontal: "$space.3",
      },
      lg: {
        height: "$lg",
        paddingHorizontal: 32,
      },
    },
    variant: {
      outline: {
        borderWidth: 1,
      },
      ghost: {
        backgroundColor: "$backgroundTransparent",
      },
    },
  } as const,
});

const ButtonText = styled(Text, {
  name: "ButtonText",
  color: "$color",
  fontFamily: "$body",
  fontSize: 14,
  lineHeight: 20,
  userSelect: "none",
});

export const IconButton = ({
  icon,
  ...rest
}: StackProps & {
  icon?: any;
}) => {
  return (
    <ButtonFrame {...rest} variant={"ghost"} size={"sm"}>
      {icon}
    </ButtonFrame>
  );
};
