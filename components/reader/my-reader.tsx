import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { router } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai/react";
import { memo, useEffect, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import {
  AnimatePresence,
  Button,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

import { LibraryItem } from "../../types/adbs";
import { bookTocAtom, currentUserAtom } from "../../utils/atoms";
import { epubDir } from "../../utils/folders";
import { ebookFormat, getUserMediaProgress } from "../../utils/helpers";
import { tempBookFilesAtom } from "../../utils/local-atoms";
import { Reader, useReader } from "../EpubReaderV2";
import ReaderMenu from "./reader-menu";

interface MyReader {
  url: string;
  item: LibraryItem;
}

interface RReaderProps {
  bookPath: string;
  width: number;
  location: string;
  height: number;
  handlePress: () => void;
  setLoading: (loading: boolean) => void;
}

/* 
  https://github.com/futurepress/epub.js/blob/master/src/utils/request.js
  https://github.com/futurepress/epub.js/blob/master/src/book.js#L131
*/
/**
 * TODO
 * make a loading so that there is only one and a atom to hold the loading state
 * isLoadingAtom
 * currentLoadingPosition i.e. downloading from server... or opeing book or ....
 */
const RReader = memo(
  ({
    bookPath,
    width,
    location,
    height,
    handlePress,
    setLoading,
  }: RReaderProps) => {
    const setToc = useSetAtom(bookTocAtom);

    const [showingNext, setShowingNext] = useState(false);
    const [showingPrev, setShowingPrev] = useState(false);
    const [currentLabel, setCurrentLabel] = useState("");
    const toast = useToastController();
    const { theme } = useReader();
    const enableSwipe = bookPath.endsWith(".pdf");

    const handleOnReady = (book: any) => {
      setLoading(false);
      const title = book.metadata?.title ?? "";
      const bookAuthor = book.metadata?.author ?? "";
      const bookToc = book.toc;

      setToc(bookToc);
    };

    useEffect(() => {
      StatusBar.setHidden(true);

      return () => {
        StatusBar.setHidden(false);
      };
    }, []);

    const popoupTheme = { bg: theme.style.theme.bg, fg: theme.style.theme.fg };

    return (
      <View>
        <AnimatePresence>
          {showingPrev ? (
            <XStack
              zIndex={"$5"}
              animation={"100ms"}
              enterStyle={{
                scale: 1.2,
                y: -100,
                opacity: 0,
              }}
              exitStyle={{
                opacity: 0,
                y: -100,
                scale: 0.9,
              }}
              pos={"absolute"}
              justifyContent="center"
              top={"$10"}
              left={0}
              right={0}
              margin={"auto"}
            >
              <Button backgroundColor={popoupTheme.fg}>
                <YStack py="$1" justifyContent="center" alignItems="center">
                  <ChevronUp size={14} />
                  <Text numberOfLines={1} color={popoupTheme.bg}>
                    RELEASE FOR: {currentLabel || "previous"}
                  </Text>
                </YStack>
              </Button>
            </XStack>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {showingNext ? (
            <XStack
              animation={"100ms"}
              enterStyle={{
                scale: 1.2,
                y: 200,
                opacity: 0,
              }}
              exitStyle={{
                opacity: 0,
                y: 200,
                scale: 0.9,
              }}
              pos={"absolute"}
              justifyContent="center"
              bottom={"$10"}
              zIndex={"$5"}
              left={0}
              right={0}
              margin={"auto"}
            >
              <Button themeInverse>
                <YStack py="$1" justifyContent="center" alignItems="center">
                  <Text numberOfLines={1}>
                    RELEASE FOR: {currentLabel || "next"}
                  </Text>
                  <ChevronDown size={14} />
                </YStack>
              </Button>
            </XStack>
          ) : null}
        </AnimatePresence>
        <Reader
          src={bookPath}
          width={width}
          initialLocation={location}
          onShowNext={(s, label) => {
            setCurrentLabel((prev) => (label ? label : prev));
            setShowingNext(s);
          }}
          onShowPrevious={(s, label) => {
            setCurrentLabel((prev) => (label ? label : prev));
            setShowingPrev(s);
          }}
          onDisplayError={(reason) => {
            toast.show("Something went wrong!", {
              message: reason,
            });
            router.back();
          }}
          onReady={handleOnReady}
          height={height}
          enableSwipe={enableSwipe}
          fileSystem={useFileSystem}
          onPress={handlePress}
          renderLoadingFileComponent={LoadingFileComponent}
          renderOpeningBookComponent={OpeningBookComponent}
        />
      </View>
    );
  }
);

const MyReader = ({ url, item }: MyReader) => {
  const { width, height } = useWindowDimensions();

  const user = useAtomValue(currentUserAtom);
  const setTempBookFiles = useSetAtom(tempBookFilesAtom);
  const [bookPath, setBookPath] = useState("");
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const [hide, setHide] = useState(false);
  const [bookTitle, setBookTitle] = useState("");

  const ebookFile =
    "ebookFile" in item.media ? item.media.ebookFile : undefined;

  const handlePress = () => {
    setHide((p) => !p);
    StatusBar.setHidden(hide, "none");
  };

  useEffect(() => {
    if (!item || !item.id) return;
    const prog = getUserMediaProgress(user, item.id);

    if (!prog || !prog.ebookLocation) return;
    setLocation(prog.ebookLocation);
  }, [item]);

  useEffect(() => {
    if (!ebookFile) return;

    const getBook = async () => {
      const itemBookName = `${item.media.libraryItemId}.${ebookFormat(
        ebookFile
      )}`;
      const cachePath = epubDir + "/" + itemBookName;
      const exists = await RNFetchBlob.fs.exists(cachePath);

      if (!exists) {
        setLoading(true);
        RNFetchBlob.config({
          fileCache: true,
          appendExt: ebookFormat(ebookFile)!,
          path: cachePath,
        })
          .fetch("GET", url, {
            Authorization: `Bearer ${user?.token}`,
          })
          .then((res) => {
            let status = res.info().status;
            if (status == 200) {
              setBookPath(res.path());
              setTempBookFiles((prev: string[]) => [...prev, res.path()]);
            }
          })
          .catch((errorMessage: any) => {
            console.error(errorMessage);
          })
          .finally(() => setLoading(false));
      } else {
        setBookPath(cachePath);
        setLoading(false);
      }
    };

    getBook();
  }, []);

  return (
    <>
      <ReaderMenu hide={hide} title={bookTitle}>
        {loading ? (
          <YStack
            h={"100%"}
            w={"100%"}
            zIndex={"$5"}
            justifyContent="center"
            alignItems="center"
          >
            <Spinner />
            <Text>Downloading file from server...</Text>
          </YStack>
        ) : (
          <RReader
            bookPath={bookPath}
            handlePress={handlePress}
            height={height}
            width={width}
            location={location || ""}
            setLoading={setLoading}
          />
        )}
      </ReaderMenu>
    </>
  );
};

const LoadingFileComponent = () => {
  return (
    <YStack
      pos={"absolute"}
      bg={"$background"}
      h={"100%"}
      w={"100%"}
      alignItems="center"
      justifyContent="center"
      zIndex={"$5"}
    >
      <Spinner />
      <Text>Loading File...</Text>
    </YStack>
  );
};

const OpeningBookComponent = () => {
  return (
    <YStack
      pos={"absolute"}
      bg={"$background"}
      h={"100%"}
      w={"100%"}
      alignItems="center"
      justifyContent="center"
      zIndex={"$5"}
    >
      <Spinner />
      <Text>Opening book...</Text>
    </YStack>
  );
};

export default MyReader;
