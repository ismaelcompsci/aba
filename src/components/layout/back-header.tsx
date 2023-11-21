import { ChevronLeft } from "@tamagui/lucide-icons";
import { Text } from "tamagui";

import { TouchableArea, TouchableAreaProps } from "../touchable/touchable-area";

import { Flex } from "./flex";

type BackButtonProps = {
  showButtonLabel?: boolean;
} & TouchableAreaProps;

const BackButton = ({ showButtonLabel, ...rest }: BackButtonProps) => {
  return (
    <TouchableArea hapticFeedback alignItems="center" hitSlop={24} {...rest}>
      <Flex row alignItems="center" gap={8}>
        <ChevronLeft />
        {showButtonLabel && <Text>Back</Text>}
      </Flex>
    </TouchableArea>
  );
};

const BackHeader = () => {
  return (
    <Flex row alignItems="center">
      <BackButton />
    </Flex>
  );
};

export default BackHeader;
