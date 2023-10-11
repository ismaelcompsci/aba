import { memo, useEffect, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import { Reader } from "../EpubReaderV2";

import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { useAtomValue, useSetAtom } from "jotai/react";
import {
  AnimatePresence,
  Button,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { ebookFormat, getUserMediaProgress } from "../../utils/helpers";
import { tempBookFilesAtom } from "../../utils/local-atoms";
import ReaderMenu from "./reader-menu";
import { currentUserAtom } from "../../utils/atoms";
import { LibraryItem } from "../../types/adbs";
import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useToastController } from "@tamagui/toast";

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
    const [showingNext, setShowingNext] = useState(false);
    const [showingPrev, setShowingPrev] = useState(false);
    const [currentLabel, setCurrentLabel] = useState("");
    const toast = useToastController();

    const enableSwipe = bookPath.endsWith(".pdf");

    console.log(enableSwipe, "enableSwipe");
    useEffect(() => {
      StatusBar.setHidden(true);

      return () => {
        StatusBar.setHidden(false);
      };
    }, []);

    return (
      <View display="flex">
        <AnimatePresence>
          {showingPrev ? (
            <XStack
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
              zIndex={"$5"}
              left={0}
              right={0}
              margin={"auto"}
            >
              <Button themeInverse>
                <YStack py="$1" justifyContent="center" alignItems="center">
                  <ChevronUp size={14} />
                  <Text numberOfLines={1}>
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
          onReady={() => setLoading(false)}
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
  const [hide, setHide] = useState(false);
  const [bookPath, setBookPath] = useState("");
  const [location, setLocation] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

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
      const itemBookPath = `epub/${item.media.libraryItemId}.${ebookFormat(
        ebookFile
      )}`;

      const cachePath = RNFetchBlob.fs.dirs.DocumentDir + "/" + itemBookPath;
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
      <ReaderMenu hide={hide}>
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
