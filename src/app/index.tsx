import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { Button, Spinner, Text, View } from "tamagui";

import { Center } from "../components/center";
import { attemptingConnectionAtom, userAtom } from "../state/app-state";

export default function IndexPage() {
  const user = useAtomValue(userAtom);
  const attemptingConnection = useAtomValue(attemptingConnectionAtom);

  return (
    <>
      {attemptingConnection ? (
        <Center>
          <Spinner />
          <Text>Attmepting to connect...</Text>
        </Center>
      ) : (
        <View
          backgroundColor={"$background"}
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <Text>HELLO WORLD INDEX PAGE</Text>
          {!user ? (
            <Button onPress={() => router.push("/server-connect/")}>
              Connect
            </Button>
          ) : null}
        </View>
      )}
    </>
  );
}
