import { memo, useEffect, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import axios from "axios";
import * as Burnt from "burnt";
import { useAtomValue, useSetAtom } from "jotai";

import { epubReaderLoadingAtom } from "../../state/app-state";
import { ebookSettignsAtom } from "../../state/local-state";
import { LibraryItemExpanded, User } from "../../types/aba";
import { awaitTimeout } from "../../utils/utils";
import { FullScreen } from "../center";

import Menu from "./components/menu";
import ScrollLabels from "./components/scroll-labels";
import { LocationChange, Reader, useReader } from "./rn-epub-reader";

interface EBookReaderProps {
  book: LibraryItemExpanded;
  user: User;
  serverAddress: string;
  bookPath: string;
  initialLocation: string | undefined;
}

const EBookReader = ({
  book,
  user,
  serverAddress,
  bookPath,
  initialLocation,
}: EBookReaderProps) => {
  const { width, height } = useWindowDimensions();
  const { changeTheme } = useReader();

  const setEpubReaderLoading = useSetAtom(epubReaderLoadingAtom);
  const ebookSettings = useAtomValue(ebookSettignsAtom);
  const [hide, setHide] = useState(false);
  const [_, setReady] = useState(false);
  const [showingNext, setShowingNext] = useState(false);
  const [showingPrev, setShowingPrev] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");

  const isPdf = bookPath.endsWith(".pdf");
  const enableSwipe = isPdf;

  const onReady = async () => {
    changeTheme(ebookSettings);
    await awaitTimeout(100);
    setReady(true);
    setEpubReaderLoading({ loading: false, part: "Opening Book..." });
  };

  const onShowPrevious = (show: boolean, label: string) => {
    setCurrentLabel((prev) => (label ? label : prev));
    setShowingPrev(show);
  };

  const onShowNext = (show: boolean, label: string) => {
    setCurrentLabel((prev) => (label ? label : prev));
    setShowingNext(show);
  };

  const onPress = () => {
    setHide((p) => !p);
  };

  const onDisplayError = (reason: string) => {
    Burnt.toast({
      preset: "error",
      title: reason,
    });
    setEpubReaderLoading({ loading: false });
  };

  const onLocationChange = ({ cfi, fraction, section }: LocationChange) => {
    let payload;
    if (!isPdf) {
      payload = {
        ebookLocation: cfi,
        ebookProgress: fraction,
      };
    } else {
      payload = {
        ebookLocation: section?.current,
        ebookProgress: fraction,
      };
    }
    console.log("ON LOCATION CHANGE");
    updateProgress(payload);
  };

  const updateProgress = async (payload: {
    ebookLocation: string;
    ebookProgress: number;
  }) => {
    try {
      if (!payload.ebookLocation && !payload.ebookProgress) return;

      axios.patch(`${serverAddress}/api/me/progress/${book.id}`, payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
    } catch (error) {
      console.log("[EBOOKREADER] Update progress error", error);
    }
  };

  useEffect(() => {
    StatusBar.setHidden(!hide);
    return () => StatusBar.setHidden(false);
  }, [hide]);

  console.log("EBOOK RERENDER");

  return (
    <Menu hide={hide} title={book.media.metadata.title || ""}>
      <FullScreen pos="absolute" t={0} b={0} r={0} l={0}>
        <ScrollLabels
          showingNext={showingNext}
          showingPrev={showingPrev}
          label={currentLabel}
          readerSettings={ebookSettings}
          menuHidden={hide}
        />
        <Reader
          height={height}
          width={width}
          src={bookPath}
          enableSwipe={enableSwipe}
          defaultTheme={ebookSettings}
          fileSystem={useFileSystem}
          onPress={onPress}
          initialLocation={initialLocation}
          onShowNext={onShowNext}
          onShowPrevious={onShowPrevious}
          onLocationChange={onLocationChange}
          onStarted={() =>
            setEpubReaderLoading({ loading: true, part: "Opening Book..." })
          }
          onReady={onReady}
          onDisplayError={onDisplayError}
        />
      </FullScreen>
    </Menu>
  );
};

export default memo(EBookReader);
