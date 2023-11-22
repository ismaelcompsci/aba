import { Text } from "tamagui";

import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";

const Settings = () => {
  return (
    <Screen edges={["top", "left", "right"]}>
      <BackHeader alignment="center" mx={16} pt={16}>
        <Text fontSize={"$6"}>Settings</Text>
      </BackHeader>
      <Flex centered fill></Flex>
    </Screen>
  );
};

export default Settings;
