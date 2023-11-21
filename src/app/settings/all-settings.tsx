import { Button, Text } from "tamagui";

import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";

const Settings = () => {
  const { headerHeight, top } = useAppSafeAreas();
  return (
    <Screen edges={["top", "left", "right"]}>
      <BackHeader />
    </Screen>
  );
};

export default Settings;
