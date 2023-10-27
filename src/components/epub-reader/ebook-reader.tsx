import { useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import RNFetchBlob from "rn-fetch-blob";
import { Text } from "tamagui";

import { epubDir } from "../../constants/consts";
import { LibraryItemExpanded } from "../../types/aba";
import { ebookFormat } from "../../utils/utils";
import { ScreenCenter } from "../center";

interface EBookReaderProps {
  book: LibraryItemExpanded;
  userToken: string;
  url: string;
}

type EpubReaderLoading = {
  loading: boolean;
  part: string;
  percent?: number;
};

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
            part: "Opening",
          });
        });
    })();
  }, []);

  console.log({ epubReaderLoading });

  return (
    <ScreenCenter paddingBottom={0}>
      <Text>HELLO</Text>
    </ScreenCenter>
  );
};

export default EBookReader;
