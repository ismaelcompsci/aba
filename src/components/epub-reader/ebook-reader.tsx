import { useEffect, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import * as Burnt from "burnt";
import { atom, useAtom, useAtomValue } from "jotai";
import RNFetchBlob from "rn-fetch-blob";
import { YStack } from "tamagui";

import { epubDir } from "../../constants/consts";
import { ebookSettignsAtom } from "../../state/local-state";
import { LibraryItemExpanded, User } from "../../types/aba";
import { EpubReaderLoading } from "../../types/types";
import {
  awaitTimeout,
  ebookFormat,
  getUserMediaProgress,
} from "../../utils/utils";
import LoadingBook from "../loading-book";

import Menu from "./components/menu";
import ScrollLabels from "./components/scroll-labels";
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
  const { changeTheme } = useReader();

  const [epubReaderLoading, setEpubReaderLoading] = useAtom(
    epubReaderLoadingAtom
  );
  const ebookSettings = useAtomValue(ebookSettignsAtom);
  const [bookPath, setBookPath] = useState("");
  const [hide, setHide] = useState(false);
  const [ready, setReady] = useState(false);
  const [showingNext, setShowingNext] = useState(false);
  const [showingPrev, setShowingPrev] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");

  const ebookFile = "ebookFile" in book.media ? book.media.ebookFile : null;
  const enableSwipe = bookPath.endsWith(".pdf");

  const initialLocation = () => {
    if (!book || !book.id) return;
    const prog = getUserMediaProgress(user, book.id);

    if (!prog || !prog.ebookLocation) return;

    return prog.ebookLocation;
  };

  const onReady = async () => {
    setEpubReaderLoading({ loading: false, part: "Opening Book..." });
    changeTheme(ebookSettings);
    await awaitTimeout(100);
    setReady(true);
  };

  const onShowPrevious = (show: boolean, label: string) => {
    setCurrentLabel((prev) => (label ? label : prev));
    setShowingPrev(show);
  };

  const onShowNext = (show: boolean, label: string) => {
    setCurrentLabel((prev) => (label ? label : prev));
    setShowingNext(show);
  };

  const onDisplayError = (reason: string) => {
    Burnt.toast({
      preset: "error",
      title: reason,
    });
    setEpubReaderLoading({ loading: false });
  };

  useEffect(() => {
    StatusBar.setHidden(!hide);
    return () => StatusBar.setHidden(false);
  }, [hide]);

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

  return (
    <Menu hide={hide} title={book.media.metadata.title || ""}>
      <YStack w="100%" h="100%">
        {epubReaderLoading.loading || !ready ? (
          <LoadingBook info={epubReaderLoading} />
        ) : null}
        <ScrollLabels
          showingNext={showingNext}
          showingPrev={showingPrev}
          label={currentLabel}
          readerSettings={ebookSettings}
        />
        <Reader
          height={height}
          width={width}
          src={bookPath}
          enableSwipe={enableSwipe}
          defaultTheme={ebookSettings}
          fileSystem={useFileSystem}
          onPress={() => setHide((p) => !p)}
          initialLocation={initialLocation()}
          onShowNext={onShowNext}
          onShowPrevious={onShowPrevious}
          onStarted={() =>
            setEpubReaderLoading({ loading: true, part: "Opening Book..." })
          }
          onReady={onReady}
          onDisplayError={onDisplayError}
        />
      </YStack>
    </Menu>
  );
};

export default EBookReader;
