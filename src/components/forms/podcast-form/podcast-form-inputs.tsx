import { Input, InputProps, Text } from "tamagui";

import { Flex, FlexProps } from "../../layout/flex";

export const PodcastFormInput = ({
  label,
  children,
  ...rest
}: {
  label: string;
  children: React.ReactNode;
} & FlexProps) => {
  return (
    <Flex gap="$1" {...rest}>
      <Text fontSize={16} fontWeight={"900"}>
        {label}
      </Text>
      {children}
    </Flex>
  );
};

export const PodcastFormTextInput = ({
  label,
  locked,
  ...rest
}: {
  label: string;
  locked?: boolean;
} & InputProps) => {
  return (
    <PodcastFormInput label={label} opacity={locked ? 0.7 : 1}>
      <Input {...rest} />
    </PodcastFormInput>
  );
};
