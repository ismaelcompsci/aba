import { Flex, FlexProps } from "./layout/flex";

export const Dot = ({ ...rest }: FlexProps) => {
  return <Flex borderRadius={100} h={5} w={5} bg="$green10" {...rest} />;
};
