import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue } from "jotai";

import EBookReader from "../../components/epub-reader/ebook-reader";
import { Screen } from "../../components/layout/screen";
import LoadingBook from "../../components/loading-book";
import { useNewUser } from "../../hooks/use-new-user";
import { currentItemAtom, serverAddressAtom } from "../../state/app-state";
import { getUserMediaProgress } from "../../utils/utils";

const ReaderPage = () => {
  const serverAddress = useAtomValue(serverAddressAtom);
  const { id, ino } = useLocalSearchParams();
  const currentItem = useAtomValue(currentItemAtom);
  const { user, refreshUser } = useNewUser(true);

  const [bookPath, setBookPath] = useState("");

  if (!currentItem || id !== currentItem?.id || !user) {
    return router.back();
  }
  const ebookFile =
    "ebookFile" in currentItem.media
      ? ino
        ? currentItem?.libraryFiles.find((lf) => lf.ino === ino)
        : currentItem?.media.ebookFile
      : null;

  const ebookUrl = () => {
    if (ino) {
      return `${serverAddress}/api/items/${currentItem!.id}/ebook/${ino}`;
    }
    return `${serverAddress}/api/items/${currentItem!.id}/ebook`;
  };

  const getInitialLocation = () => {
    if (!currentItem || !currentItem.id) return;
    const prog = getUserMediaProgress(user, currentItem.id);

    if (!prog || !prog.ebookLocation) return;

    return prog.ebookLocation;
  };

  const url = ebookUrl();

  const initialLocation = getInitialLocation();

  useEffect(() => {
    return () => {
      refreshUser();
    };
  }, []);

  return (
    <Screen centered>
      <LoadingBook
        url={url}
        user={user}
        ebookFile={ebookFile}
        book={currentItem}
        setBookPath={(path) => setBookPath(path)}
      />
      {user && bookPath !== "" ? (
        <EBookReader
          book={currentItem!}
          user={user}
          bookPath={bookPath}
          serverAddress={serverAddress}
          initialLocation={initialLocation}
        />
      ) : null}
    </Screen>
  );
};

export default ReaderPage;
