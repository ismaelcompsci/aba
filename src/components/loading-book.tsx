import { useEffect } from "react";
import { useAtom, useSetAtom } from "jotai";
import RNFetchBlob from "rn-fetch-blob";
import { Progress, Text, useTheme } from "tamagui";

import { epubDir } from "../constants/consts";
import { epubReaderLoadingAtom } from "../state/epub-reader-state";
import { cachedBookFilePathsAtom } from "../state/local-state";
import {
  EbookFile,
  LibraryFile,
  LibraryItemExpanded,
  User,
} from "../types/aba";
import { ebookFormat } from "../utils/utils";

import { Flex } from "./layout/flex";
import { Screen } from "./layout/screen";

const LoadingBook = ({
  ebookFile,
  user,
  url,
  book,
  setBookPath,
}: {
  ebookFile: LibraryFile | EbookFile | null | undefined;
  user: User;
  url: string;
  book: LibraryItemExpanded;
  setBookPath: (path: string) => void;
}) => {
  const [epubReaderLoading, setEpubReaderLoading] = useAtom(
    epubReaderLoadingAtom
  );

  const setCachedBookFilePaths = useSetAtom(cachedBookFilePathsAtom);

  const colors = useTheme();

  useEffect(() => {
    if (!ebookFile) return;

    (async () => {
      const bookDownloadName = `${book.media.libraryItemId}.${ebookFormat(
        // @ts-ignore TODO
        ebookFile
      )}`;
      const bookDownloadPath = `${epubDir}/${bookDownloadName}`;

      const isDownloaded = await RNFetchBlob.fs.exists(bookDownloadPath);

      if (isDownloaded) {
        setEpubReaderLoading({
          loading: true,
          part: "Downloading",
          percent: 1,
        });
        setBookPath(bookDownloadPath);
      } else {
        console.log("FETCHING");
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

            if (status === 200) {
              setCachedBookFilePaths((prev) => [...prev, path]);
              setBookPath(path);
            }
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
      }
    })();
  }, []);

  if (!epubReaderLoading.loading) return null;

  return (
    <Screen
      h={"100%"}
      width={"100%"}
      px="$8"
      space="$4"
      pos="absolute"
      zi={88888}
      centered
    >
      <Flex row gap="$4" ai="center" bg={"$background"}>
        {epubReaderLoading.percent ? (
          <Progress
            value={
              epubReaderLoading.percent ? epubReaderLoading.percent * 100 : 0
            }
          >
            <Progress.Indicator bg={colors.color.get()} animation="bouncy" />
          </Progress>
        ) : null}
        <Text>
          {epubReaderLoading.percent
            ? Math.trunc(epubReaderLoading.percent * 100)
            : 0}
          %
        </Text>
      </Flex>
      <Text>
        {epubReaderLoading.part ? epubReaderLoading.part : "Opening"}...
      </Text>
    </Screen>
  );
};

export default LoadingBook;
