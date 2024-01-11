/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Spinner } from "tamagui";

import EBookReader from "../../components/epub-reader/ebook-reader";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import LoadingBook from "../../components/loading-book";
import {
  currentItemAtom,
  mediaProgressAtom,
  serverAddressAtom,
  userAtom,
} from "../../state/app-state";
import {
  epubReaderCurrentLocationAtom,
  epubReaderSectionFractionsAtom,
  epubReaderTocAtom,
} from "../../state/epub-reader-state";
import { ebookSettignsAtom } from "../../state/local-state";
import { LibraryItemExpanded } from "../../types/aba";

const ReaderPage = () => {
  const serverAddress = useAtomValue(serverAddressAtom);
  const { id, ino } = useLocalSearchParams();
  const [currentItem, setCurrentItem] = useAtom(currentItemAtom);
  const user = useAtomValue(userAtom);
  const mediaProgres = useAtomValue(mediaProgressAtom);
  const ebookSettings = useAtomValue(ebookSettignsAtom);

  const setEpubReadeToc = useSetAtom(epubReaderTocAtom);
  const setEpubReaderSectionFractionsAtom = useSetAtom(
    epubReaderSectionFractionsAtom
  );
  const setEpubReaderCurrentLocation = useSetAtom(
    epubReaderCurrentLocationAtom
  );
  const [bookPath, setBookPath] = useState("");

  const { isLoading, isFetching } = useQuery({
    queryKey: ["bookItem", id],
    queryFn: async () => {
      const response = await axios.get(`${serverAddress}/api/items/${id}`, {
        params: {
          expanded: 1,
          include: "rssfeed",
        },
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      setCurrentItem(response.data);
      return response.data as LibraryItemExpanded;
    },
  });

  if (!user) {
    return router.back();
  }

  const ebookFile =
    currentItem && "ebookFile" in currentItem.media
      ? ino
        ? currentItem?.libraryFiles.find((lf) => lf.ino === ino)
        : currentItem?.media.ebookFile
      : null;

  const ebookUrl = () => {
    if (ino) {
      return `${serverAddress}/api/items/${currentItem?.id}/ebook/${ino}`;
    }
    return `${serverAddress}/api/items/${currentItem?.id}/ebook`;
  };

  const getInitialLocation = () => {
    if (!currentItem) return;
    const prog = mediaProgres.find((v) => v.libraryItemId === id);

    if (!prog || !prog.ebookLocation) return;

    return prog.ebookLocation;
  };

  const url = ebookUrl();

  const props = useMemo(
    () => ({
      userId: user?.id,
      userToken: user?.token,
      initialLocation: getInitialLocation(),
      ebookSettings,
    }),
    [currentItem]
  );

  useEffect(() => {
    return () => {
      setEpubReadeToc(null);
      setEpubReaderSectionFractionsAtom(null);
      setEpubReaderCurrentLocation(null);
    };
  }, []);

  if (isLoading || isFetching) {
    return (
      <Flex fill centered bg={"$background"}>
        <Spinner />
      </Flex>
    );
  }

  if (!isLoading && !isFetching && !currentItem) {
    return <Redirect href={"/"} />;
  }

  return (
    <Screen>
      {currentItem ? (
        <LoadingBook
          url={url}
          user={user}
          ebookFile={ebookFile}
          book={currentItem}
          setBookPath={(path) => setBookPath(path)}
        />
      ) : null}
      {user && bookPath !== "" ? (
        <EBookReader
          book={currentItem!}
          userId={props.userId}
          userToken={props.userToken}
          bookPath={bookPath}
          ebookSettings={props.ebookSettings}
          serverAddress={serverAddress}
          initialLocation={props.initialLocation}
        />
      ) : null}
    </Screen>
  );
};

export default ReaderPage;
