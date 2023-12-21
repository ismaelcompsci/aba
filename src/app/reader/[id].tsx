/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";

import EBookReader from "../../components/epub-reader/ebook-reader";
import { Screen } from "../../components/layout/screen";
import LoadingBook from "../../components/loading-book";
import {
  currentItemAtom,
  epubReaderCurrentLocationAtom,
  epubReaderSectionFractionsAtom,
  mediaProgressAtom,
  serverAddressAtom,
  userAtom,
} from "../../state/app-state";

const ReaderPage = () => {
  const serverAddress = useAtomValue(serverAddressAtom);
  const { id, ino } = useLocalSearchParams();
  const currentItem = useAtomValue(currentItemAtom);
  const user = useAtomValue(userAtom);
  const mediaProgres = useAtomValue(mediaProgressAtom);

  const setEpubReaderSectionFractionsAtom = useSetAtom(
    epubReaderSectionFractionsAtom
  );
  const setEpubReaderCurrentLocation = useSetAtom(
    epubReaderCurrentLocationAtom
  );

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
    const prog = mediaProgres.find((v) => v.libraryItemId === id);

    if (!prog || !prog.ebookLocation) return;

    return prog.ebookLocation;
  };

  const url = ebookUrl();

  const props = useMemo(
    () => ({
      userId: user.id,
      userToken: user.token,
      initialLocation: getInitialLocation(),
    }),
    []
  );

  useEffect(() => {
    return () => {
      setEpubReaderSectionFractionsAtom(null);
      setEpubReaderCurrentLocation(null);
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
          userId={props.userId}
          userToken={props.userToken}
          bookPath={bookPath}
          serverAddress={serverAddress}
          initialLocation={props.initialLocation}
        />
      ) : null}
    </Screen>
  );
};

export default ReaderPage;
