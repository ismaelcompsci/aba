import { Stack, styled, Text } from "@tamagui/core";
import { useState } from "react";
import { StackProps } from "tamagui";

const ButtonFrame = styled(Stack, {
  name: "Button",
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "center",
  backgroundColor: "$backgroundTransparent",
  borderColor: "transparent",
  borderWidth: 0.5,
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
        borderWidth: 0.5,
        borderColor: "$gray10Dark",
      },
      selected: {
        borderWidth: 0.5,
        borderColor: "$blue10Dark",
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
  text,
  selected,
  ...rest
}: StackProps & {
  icon?: any;
  text?: string;
  selected?: boolean;
}) => {
  const [userSelected, setUserSelected] = useState(selected ? selected : false);

  return (
    <ButtonFrame
      {...rest}
      variant={userSelected ? "selected" : "outline"}
      size={"sm"}
      onPress={(event) => {
        if (rest.onPress) {
          rest?.onPress(event);
        }

        selected ? setUserSelected((prev) => !prev) : setUserSelected(false);
      }}
    >
      {icon}
      {rest.children}
    </ButtonFrame>
  );
};
