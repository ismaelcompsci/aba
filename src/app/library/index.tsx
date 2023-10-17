import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { Button, Spinner, Text } from "tamagui";

import { ScreenCenter } from "../../components/center";
import { attemptingConnectionAtom, userAtom } from "../../state/app-state";

const LibraryPage = () => {
  const user = useAtomValue(userAtom);
  const attemptingConnection = useAtomValue(attemptingConnectionAtom);

  return (
    <>
      {attemptingConnection ? (
        <ScreenCenter>
          <Spinner />
          <Text>Attmepting to connect...</Text>
        </ScreenCenter>
      ) : (
        <ScreenCenter>
          <Text>HELLO WORLD LIBRARY PAGE</Text>
          {!user ? (
            <Button onPress={() => router.push("/server-connect/")}>
              Connect
            </Button>
          ) : null}
        </ScreenCenter>
      )}
    </>
  );
};

export default LibraryPage;
