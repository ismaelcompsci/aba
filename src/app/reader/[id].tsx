import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";
import { YStack } from "tamagui";

import EBookReader from "../../components/epub-reader/ebook-reader";
import { ReaderProvider } from "../../components/epub-reader/rn-epub-reader";
import { currentItemAtom, userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";

const ReaderPage = () => {
  const { id, ino } = useLocalSearchParams();
  const currentItem = useAtomValue(currentItemAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);

  if (!currentItem || id !== currentItem?.id || !user) {
    return router.back();
  }

  const ebookUrl = () => {
    if (ino) {
      return `${serverConfig.serverAddress}/api/items/${
        currentItem!.id
      }/ebook/${ino}`;
    }
    return `${serverConfig.serverAddress}/api/items/${currentItem!.id}/ebook`;
  };

  const url = ebookUrl();

  return (
    <YStack h={"100%"} w={"100%"} bg={"$background"} pos="relative">
      <ReaderProvider>
        <EBookReader
          url={url}
          book={currentItem!}
          user={user}
          ino={ino as string}
        />
      </ReaderProvider>
    </YStack>
  );
};

export default ReaderPage;
