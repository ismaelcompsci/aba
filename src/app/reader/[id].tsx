import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";

import { FullScreen } from "../../components/center";
import EBookReader from "../../components/epub-reader/ebook-reader";
import { ReaderProvider } from "../../components/epub-reader/rn-epub-reader";
import { useNewUser } from "../../hooks/use-new-user";
import { currentItemAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";

const ReaderPage = () => {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const { id, ino } = useLocalSearchParams();
  const currentItem = useAtomValue(currentItemAtom);
  const { user } = useNewUser();

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
    <FullScreen pos="relative">
      <ReaderProvider>
        {user ? (
          <EBookReader
            url={url}
            book={currentItem!}
            user={user}
            ino={ino as string}
            serverAddress={serverConfig.serverAddress}
          />
        ) : null}
      </ReaderProvider>
    </FullScreen>
  );
};

export default ReaderPage;
