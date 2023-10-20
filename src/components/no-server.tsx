import { router } from "expo-router";
import { Button, Text } from "tamagui";

import { ScreenCenter } from "./center";

const NoServer = () => {
  return (
    <ScreenCenter space="$4">
      <Button onPress={() => router.push("/server-connect/")}>Log in</Button>
      <Text color="$red10">No server connected</Text>
    </ScreenCenter>
  );
};

export default NoServer;
