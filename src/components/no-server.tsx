import { router } from "expo-router";
import { Button, Text } from "tamagui";

import { Screen } from "./layout/screen";

const NoServer = () => {
  return (
    <Screen space="$4">
      <Button onPress={() => router.push("/server-connect/")}>Log in</Button>
      <Text color="$red10">No server connected</Text>
    </Screen>
  );
};

export default NoServer;
