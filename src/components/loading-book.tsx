import { useEffect } from "react";
import { useAtom } from "jotai";
import RNFetchBlob from "rn-fetch-blob";
import { Progress, Text, XStack } from "tamagui";

import { epubDir } from "../constants/consts";
import { epubReaderLoadingAtom } from "../state/app-state";
import {
  EbookFile,
  LibraryFile,
  LibraryItemExpanded,
  User,
} from "../types/aba";
import { ebookFormat } from "../utils/utils";

import { ScreenCenter } from "./center";

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
        setBookPath(bookDownloadPath);
      } else {
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
      }
    })();
  }, []);

  if (epubReaderLoading.loading === false) return null;

  return (
    <ScreenCenter
      paddingBottom={0}
      px="$8"
      space="$4"
      pos="absolute"
      zIndex={88888}
    >
      <XStack gap="$4" ai="center">
        {epubReaderLoading.percent ? (
          <Progress
            value={
              epubReaderLoading.percent ? epubReaderLoading.percent * 100 : 0
            }
          >
            <Progress.Indicator animation="bouncy" />
          </Progress>
        ) : null}
        <Text>
          {epubReaderLoading.percent
            ? Math.trunc(epubReaderLoading.percent * 100)
            : 0}
          %
        </Text>
      </XStack>
      <Text>
        {epubReaderLoading.part ? epubReaderLoading.part : "Opening"}...
      </Text>
    </ScreenCenter>
  );
};

export default LoadingBook;
