/**
 * https://github.com/Uniswap/wallet/tree/0339c44a5eb3fe23aeb423186c5de54a6f3cf720/packages/ui
 */
import { PropsWithChildren } from "react";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { ColorTokens, Text } from "tamagui";

import { TouchableArea, TouchableAreaProps } from "../touchable/touchable-area";

import { Flex, FlexProps } from "./flex";

type BackButtonProps = {
  size?: number;
  color?: ColorTokens;
  showButtonLabel?: boolean;
  onPressBack?: () => void;
} & TouchableAreaProps;

export const BackButton = ({
  onPressBack,
  color,
  size,
  showButtonLabel,
  ...rest
}: BackButtonProps) => {
  const goBack = onPressBack ? onPressBack : () => router.back();
  return (
    <TouchableArea
      hapticFeedback
      alignItems="center"
      hitSlop={24}
      {...rest}
      onPress={goBack}
    >
      <Flex row alignItems="center" gap={8}>
        <ChevronLeft color={color} size={size} />
        {showButtonLabel && <Text>Back</Text>}
      </Flex>
    </TouchableArea>
  );
};

type BackHeaderProps = {
  alignment?: "left" | "center";
  endAdornment?: JSX.Element;
  showButtonLabel?: boolean;
  onPressBack?: () => void;
} & FlexProps;

const BACK_BUTTON_SIZE = 24;

const BackHeader = ({
  alignment,
  endAdornment = <Flex width={24} />,
  onPressBack,
  showButtonLabel,
  children,
  ...rest
}: PropsWithChildren<BackHeaderProps>) => {
  return (
    <Flex
      row
      alignItems="center"
      justifyContent={alignment === "left" ? "flex-start" : "space-between"}
      {...rest}
    >
      <BackButton
        size={BACK_BUTTON_SIZE}
        onPressBack={onPressBack}
        showButtonLabel={showButtonLabel}
      />
      {children}
      {endAdornment}
    </Flex>
  );
};

export default BackHeader;
