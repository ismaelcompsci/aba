import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useFileSystem } from "@epubjs-react-native/expo-file-system"; // for Expo project
import * as Burnt from "burnt";
import { atom, useAtom } from "jotai";
import RNFetchBlob from "rn-fetch-blob";
import { XStack, YStack } from "tamagui";

import { epubDir } from "../../constants/consts";
import { HEADER_HEIGHT } from "../../hooks/use-header-height";
import { LibraryItemExpanded, User } from "../../types/aba";
import { EpubReaderLoading } from "../../types/types";
import { ebookFormat, getUserMediaProgress } from "../../utils/utils";
import LoadingBook from "../loading-book";

import { Reader, useReader } from "./rn-epub-reader";

interface EBookReaderProps {
  book: LibraryItemExpanded;
  user: User;
  url: string;
}

const epubReaderLoadingAtom = atom<EpubReaderLoading>({
  loading: false,
  part: "",
  percent: undefined,
});

const EBookReader = ({ book, url, user }: EBookReaderProps) => {
  const { width, height } = useWindowDimensions();
  const { isRendering, isLoading } = useReader();

  const [epubReaderLoading, setEpubReaderLoading] = useAtom(
    epubReaderLoadingAtom
  );
  const [bookPath, setBookPath] = useState("");
  const [hide, setHide] = useState(false);

  const ebookFile = "ebookFile" in book.media ? book.media.ebookFile : null;
  const enableSwipe = bookPath.endsWith(".pdf");

  useEffect(() => {
    if (!ebookFile) return;

    (async () => {
      const bookDownloadName = `${book.media.libraryItemId}.${ebookFormat(
        ebookFile
      )}`;
      const bookDownloadPath = `${epubDir}/${bookDownloadName}`;

      setEpubReaderLoading({
        loading: true,
        part: "Downloading",
        percent: 0,
      });

      RNFetchBlob.config({
        path: bookDownloadPath,
      })
        .fetch("GET", url, {
          Authorization: `Bearer ${user.token}`,
        })
        .progress((received, total) => {
          const percent = received / total;
          setEpubReaderLoading({
            loading: true,
            part: "Downloading",
            percent: percent,
          });
        })
        .then((res) => {
          const status = res.info().status;
          const path = res.path();

          if (status === 200) setBookPath(path);
        })
        .catch((error) => {
          console.log({ error });
        })
        .finally(() => {
          setEpubReaderLoading({
            loading: true,
            part: "Downloading",
            percent: 1,
          });
        });
    })();
  }, []);

  const initialLocation = () => {
    if (!book || !book.id) return;
    const prog = getUserMediaProgress(user, book.id);

    if (!prog || !prog.ebookLocation) return;

    return prog.ebookLocation;
  };

  return (
    <YStack w="100%" h="100%">
      {hide ? (
        <>
          <XStack
            h={HEADER_HEIGHT}
            bg="red"
            pos="absolute"
            top={0}
            left={0}
            right={0}
            zIndex="$5"
          />
          <XStack
            h={HEADER_HEIGHT}
            bg="red"
            pos="absolute"
            bottom={0}
            left={0}
            right={0}
            zIndex="$5"
          />
        </>
      ) : null}

      {epubReaderLoading.loading ? (
        <LoadingBook info={epubReaderLoading} />
      ) : null}
      {bookPath ? (
        <Reader
          height={height}
          width={width}
          src={bookPath}
          enableSwipe={enableSwipe}
          fileSystem={useFileSystem}
          onPress={() => setHide((p) => !p)}
          initialLocation={initialLocation()}
          onStarted={() =>
            setEpubReaderLoading({ loading: true, part: "Opening Book..." })
          }
          onReady={() =>
            setEpubReaderLoading({ loading: false, part: "Opening Book..." })
          }
          onDisplayError={(reason) => {
            Burnt.toast({
              preset: "error",
              title: reason,
            });
            setEpubReaderLoading({ loading: false });
          }}
        />
      ) : null}
    </YStack>
  );
};

export default EBookReader;
