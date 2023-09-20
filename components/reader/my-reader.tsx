import { useEffect, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import { Reader } from "../EpubReaderV2";
import * as FileSystem from "expo-file-system";

import { useFileSystem } from "@epubjs-react-native/expo-file-system"; // for Expo project
import { useAtomValue, useSetAtom } from "jotai/react";
import { Spinner, YStack } from "tamagui";
import { LibraryItem } from "../../types/server";
import { createThemeForBook, ebookFormat } from "../../utils/helpers";
import { currentUserAtom, tempBookFilesAtom } from "../../utils/local-atoms";
import ReaderMenu from "./reader-menu";

interface MyReader {
  url: string;
  item: LibraryItem;
}

const darkTheme = createThemeForBook({
  body: {
    color: "#dfe0e6",
    "background-color": "#111",
    "font-size": "20px",
    "padding-top": "32px !important",
  },
});

const MyReader = ({ url, item }: MyReader) => {
  const { width, height } = useWindowDimensions();

  const user = useAtomValue(currentUserAtom);
  const setTempBookFiles = useSetAtom(tempBookFilesAtom);
  const [hide, setHide] = useState(false);
  const [bookPath, setBookPath] = useState("");
  const [location, setLocation] = useState<string | undefined>(undefined);

  const getUserMediaProgress = (libraryItemId: string) => {
    if (!user.mediaProgress || !libraryItemId) return;

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
      ebookFormat(item?.media.ebookFile) || "epub"
    }`;

    const cachePath = RNFetchBlob.fs.dirs.DocumentDir + "/" + itemBookPath;

    (async () => {
      RNFetchBlob.config({
        fileCache: true,
        appendExt: ebookFormat(item?.media.ebookFile) || "epub",
        path: cachePath,
      })
        .fetch("GET", url, {
          Authorization: `Bearer ${user.token}`,
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
        });
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
        <Reader
          src={bookPath}
          width={width}
          initialLocation={location}
          height={height}
          fileSystem={useFileSystem}
          onPress={handlePress}
          defaultTheme={darkTheme}
          renderLoadingFileComponent={LoadingFileComponent}
          renderOpeningBookComponent={LoadingFileComponent}
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
