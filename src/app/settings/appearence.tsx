import type { IconProps } from "@tamagui/helpers-icon";
import { Check, Moon, Sun } from "@tamagui/lucide-icons";
import { useAtom } from "jotai";
import { Text } from "tamagui";

import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { TouchableArea } from "../../components/touchable/touchable-area";
import { appThemeAtom } from "../../state/local-state";

const Appearance = () => {
  const [appTheme, setAppTheme] = useAtom(appThemeAtom);

  return (
    <Screen edges={["top"]}>
      <BackHeader alignment="center" mx={16} pt={16}>
        <Text fontSize={"$6"}>Appearance</Text>
      </BackHeader>
      <Flex p={24}>
        <AppearanceOption
          setTheme={() => setAppTheme({ scheme: "light" })}
          title="Light Mode"
          active={appTheme.scheme === "light"}
          Icon={() => <Sun color="$gray11" />}
        />
        <AppearanceOption
          setTheme={() => setAppTheme({ scheme: "dark" })}
          title="Dark Mode"
          active={appTheme.scheme === "dark"}
          Icon={() => <Moon color="$gray11" />}
        />
      </Flex>
    </Screen>
  );
};

type AppearanceProps = {
  active?: boolean;
  title: string;
  Icon: React.FC<IconProps>;
  setTheme: () => void;
};

const AppearanceOption = ({
  active,
  title,
  setTheme,
  Icon,
}: AppearanceProps) => {
  const isActive = active ? 1 : 0;
  return (
    <TouchableArea
      alignItems="center"
      flexDirection="row"
      justifyContent="space-between"
      py={12}
      onPress={() => setTheme()}
    >
      <Icon height={24} strokeWidth={1.5} width={24} />
      <Flex row shrink>
        <Flex shrink ml={16}>
          <Text fontSize={18} lineHeight={24} fontWeight={"400"}>
            {title}
          </Text>
        </Flex>
        <Flex
          grow
          alignItems="flex-end"
          justifyContent="center"
          opacity={isActive}
        >
          <Check />
        </Flex>
      </Flex>
    </TouchableArea>
  );
};

export default Appearance;
