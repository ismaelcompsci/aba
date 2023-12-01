import { Text } from "tamagui";

import { Flex, FlexProps } from "./layout/flex";

export const PodcastLabel = ({
  label,
  ...rest
}: FlexProps & {
  label: string;
}) => {
  return (
    <Flex
      borderRadius={8}
      bg={"$backgroundFocus"}
      padding={2}
      alignItems="center"
      px={4.5}
      {...rest}
    >
      <Text textAlign="center" fontSize={11}>
        {label}
      </Text>
    </Flex>
  );
};
