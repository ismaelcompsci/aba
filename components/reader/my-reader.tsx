import { memo, useEffect, useMemo, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import { Reader, Theme, useReader } from "../EpubReaderV2";

import { useFileSystem } from "@epubjs-react-native/expo-file-system"; // for Expo project
import { useAtomValue, useSetAtom } from "jotai/react";
import { Spinner, YStack } from "tamagui";
import { ebookFormat } from "../../utils/helpers";
import { tempBookFilesAtom } from "../../utils/local-atoms";
import ReaderMenu from "./reader-menu";
import { currentUserAtom } from "../../utils/atoms";
import { LibraryItem } from "../../types/adbs";
import { createThemeForBook } from "../../utils/themes";

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

const RReader = memo(
  ({
    bookPath,
    width,
    location,
    height,
    handlePress,
    setLoading,
  }: RReaderProps) => {
    return (
      <Reader
        src={bookPath}
        width={width}
        initialLocation={location}
        // onReady={() => setLoading(false)}
        height={height}
        fileSystem={useFileSystem}
        onPress={handlePress}
        // renderLoadingFileComponent={LoadingFileComponent}
        // renderOpeningBookComponent={LoadingFileComponent}
      />
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

  const getUserMediaProgress = (libraryItemId: string) => {
    if (!user?.mediaProgress || !libraryItemId) return;

    return user?.mediaProgress.find((md) => md.libraryItemId == libraryItemId);
  };

  const handlePress = () => {
    setHide((p) => !p);
    StatusBar.setHidden(hide, "none");
  };

  useEffect(() => {
    if (!item || !item.id) return;
    const prog = getUserMediaProgress(item.id);

    if (!prog || !prog.ebookLocation) return;
    setLocation(prog.ebookLocation);
  }, [item]);

  useEffect(() => {
    const itemBookPath = `epub/${item.media.libraryItemId}.${
      ebookFormat(ebookFile) || "epub"
    }`;

    const cachePath = RNFetchBlob.fs.dirs.DocumentDir + "/" + itemBookPath;

    (async () => {
      setLoading(true);
      RNFetchBlob.config({
        fileCache: true,
        appendExt: ebookFormat(ebookFile) || "epub",
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
    })();
  }, []);

  useEffect(() => {
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  return (
    <>
      <ReaderMenu hide={hide}>
        {/* {loading && (
          <YStack
            h={"100%"}
            w={"100%"}
            zIndex={"$5"}
            pos={"absolute"}
            justifyContent="center"
            alignItems="center"
          >
            <Spinner />
          </YStack>
        )} */}

        <RReader
          bookPath={bookPath}
          handlePress={handlePress}
          height={height}
          width={width}
          location={location || ""}
          setLoading={setLoading}
        />
      </ReaderMenu>
    </>
  );
};

const LoadingFileComponent = () => {
  return (
    <YStack
      bg={"#111"}
      h={"100%"}
      w={"100%"}
      alignItems="center"
      justifyContent="center"
    >
      <Spinner />
    </YStack>
  );
};

export default MyReader;
