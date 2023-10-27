import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import RNFetchBlob from "rn-fetch-blob";
import { YStack } from "tamagui";

import { epubDir } from "../../constants/consts";
import { LibraryItemExpanded } from "../../types/aba";
import { EpubReaderLoading } from "../../types/types";
import { ebookFormat } from "../../utils/utils";
import LoadingBook from "../loading-book";

interface EBookReaderProps {
  book: LibraryItemExpanded;
  userToken: string;
  url: string;
}

const epubReaderLoadingAtom = atom<EpubReaderLoading>({
  loading: false,
  part: "",
  percent: undefined,
});

const EBookReader = ({ book, url, userToken }: EBookReaderProps) => {
  const [epubReaderLoading, setEpubReaderLoading] = useAtom(
    epubReaderLoadingAtom
  );
  const [bookPath, setBookPath] = useState("");
  const ebookFile = "ebookFile" in book.media ? book.media.ebookFile : null;

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
          Authorization: `Bearer ${userToken}`,
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
    <YStack w="100%" h="100%">
      {epubReaderLoading.loading ? (
        <LoadingBook info={epubReaderLoading} />
      ) : null}
    </YStack>
  );
};

export default EBookReader;
