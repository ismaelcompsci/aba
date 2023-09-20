import { useAtomValue } from "jotai/react";
import { Button, Text, XStack, YStack } from "tamagui";
import { currentItemAtom } from "../../utils/atoms";
import { useState } from "react";

import MyReader from "../../components/reader/my-reader";
import { currentServerConfigAtom } from "../../utils/local-atoms";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ReaderProvider } from "../../components/EpubReaderV2";

const ReaderPage = () => {
  const currentServerConfig = useAtomValue(currentServerConfigAtom);
  const currentItem = useAtomValue(currentItemAtom);

  const [hide, setHide] = useState(false);

  if (!currentItem) {
    // TODO BETTER ERROR VIEW
    return null;
  }

  const ebookUrl = () => {
    const url = `${currentServerConfig.serverAddress}/api/items/${currentItem.id}/ebook`;
    return url;
  };

  return (
    <YStack h={"100%"} w={"100%"} bg={"$background"} pos={"relative"}>
      <ReaderProvider>
        <MyReader url={ebookUrl()} item={currentItem} />
      </ReaderProvider>
    </YStack>
  );
};

export default ReaderPage;
