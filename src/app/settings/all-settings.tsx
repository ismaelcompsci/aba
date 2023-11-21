import { Text } from "tamagui";

import BackHeader from "../../components/layout/back-header";
import { Screen } from "../../components/layout/screen";

const Settings = () => {
  return (
    <Screen edges={["top", "left", "right"]}>
      <BackHeader alignment="center" mx={16} pt={16}>
        <Text fontSize={"$6"}>Settings</Text>
      </BackHeader>
    </Screen>
  );
};

export default Settings;
