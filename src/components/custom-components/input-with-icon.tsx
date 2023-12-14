import type { IconProps } from "@tamagui/helpers-icon";
import { Input, InputProps } from "tamagui";

import { Flex } from "../layout/flex";

const InputWithIcon = ({
  icon: Icon,
  ...rest
}: { icon: React.NamedExoticComponent<IconProps> } & InputProps) => {
  return (
    <Flex row ai="center">
      <Flex pos="absolute" zi="$1" pl={"$2"}>
        <Icon size={"$1"} />
      </Flex>
      <Input
        paddingLeft={30}
        placeholder="search"
        flex={1}
        clearButtonMode="always"
        {...rest}
      />
    </Flex>
  );
};

export default InputWithIcon;
