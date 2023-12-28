import { XCircle } from "@tamagui/lucide-icons";
import { Redirect, router, Unmatched } from "expo-router";
import { useAtomValue } from "jotai";
import { Button, Text } from "tamagui";

import { Flex } from "../components/layout/flex";
import { Screen } from "../components/layout/screen";
import { routeAtom, showPlayerAtom } from "../state/app-state";

const UnmatchedPage = () => {
  const route = useAtomValue(routeAtom);
  const showPlayer = useAtomValue(showPlayerAtom);

  if (route?.path === "notification.click") {
    return <Redirect href={`/book/${showPlayer?.libraryItemId}`} />;
  }

  return (
    <Screen fill centered>
      <Flex jc={"center"} ai={"center"} space="$2">
        <XCircle color="$red10" size="$8" />
        <Text color="$gray10">Something went wrong!</Text>
        <Button onPress={() => router.push("/")}>Home</Button>
      </Flex>
    </Screen>
  );
};

export default UnmatchedPage;
