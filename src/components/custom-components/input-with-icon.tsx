import type { IconProps } from "@tamagui/helpers-icon";
import { Input, InputProps, Stack, XStack } from "tamagui";

const InputWithIcon = ({
  icon: Icon,
  ...rest
}: { icon: React.NamedExoticComponent<IconProps> } & InputProps) => {
  return (
    <XStack ai="center">
      <Stack pos="absolute" zi="$1" pl={"$2"}>
        <Icon size={"$1"} />
      </Stack>
      <Input
        paddingLeft={28}
        placeholder="search"
        flex={1}
        {...rest}
        clearButtonMode="always"
      />
    </XStack>
  );
};

export default InputWithIcon;
