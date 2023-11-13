import { memo, useEffect, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import axios from "axios";
import * as Burnt from "burnt";
import { router, useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import {
  epubReaderLoadingAtom,
  epubReaderOverviewModalAtom,
  epubReaderTocAtom,
} from "../../state/app-state";
import {
  bookAnnotationsAtom,
  ebookSettignsAtom,
} from "../../state/local-state";
import { LibraryItemExpanded, User } from "../../types/aba";
import { awaitTimeout } from "../../utils/utils";
import { FullScreen } from "../center";

import { BookChapterModal } from "./components/book-modal";
import Menu from "./components/menu";
import ScrollLabels from "./components/scroll-labels";
import {
  Annotation,
  BookAnnotations,
  LocationChange,
  MenuSelectionEvent,
  Reader,
  ReaderBook,
  useReader,
} from "./rn-epub-reader";

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
  const { id } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();

  const [bookAnnotations, setBookAnnotations] = useAtom(bookAnnotationsAtom);
  const setEpubReaderOverviewModal = useSetAtom(epubReaderOverviewModalAtom);
  const setEpubReaderLoading = useSetAtom(epubReaderLoadingAtom);
  const setEpubReaderToc = useSetAtom(epubReaderTocAtom);
  const ebookSettings = useAtomValue(ebookSettignsAtom);
  const [hide, setHide] = useState(false);
  const [showingNext, setShowingNext] = useState(false);
  const [showingPrev, setShowingPrev] = useState(false);
  const [currentLabel, setCurrentLabel] = useState("");
  const { setIsPdf, useMenuAction, setAnnotations } = useReader();

  const isPdf = bookPath.endsWith(".pdf");
  const enableSwipe = isPdf;

  const onReady = async (readyBook: ReaderBook) => {
    const annotations = bookAnnotations[book.id];
    if (annotations) setAnnotations(annotations);

    setEpubReaderToc(readyBook.toc);

    setEpubReaderLoading({
      loading: true,
      part: "Opening Book...",
      percent: 1,
    });
    await awaitTimeout(100);
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
    router.back();
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
        ebookLocation: section.current,
        ebookProgress: fraction,
      };
    }
    updateProgress(payload);
  };

  const onCustomMenuSelection = (event: MenuSelectionEvent) => {
    switch (event.nativeEvent.key) {
      case "copy":
        useMenuAction({ action: "copy" });
        break;
      case "highlight":
        useMenuAction({ action: "highlight", color: "yellow" });
        break;
      case "strikethrough":
        useMenuAction({ action: "highlight", color: "strikethrough" });
        break;
      case "squiggly":
        useMenuAction({ action: "highlight", color: "squiggly" });
        break;
      case "underline":
        useMenuAction({ action: "highlight", color: "underline" });
        break;
      default:
        break;
    }
  };

  const onNewAnnotation = (annotation: Annotation) => {
    // @ts-ignore
    if (annotation.pos) delete annotation.pos;
    // @ts-ignore
    if (annotation.lang) delete annotation.lang;
    // @ts-ignore
    if (annotation.range) delete annotation.range;

    setBookAnnotations((prev: BookAnnotations) => {
      const newAnnotations = { ...prev };

      if (newAnnotations[book.id]?.length >= 0) {
        newAnnotations[book.id].push(annotation);
      } else {
        newAnnotations[book.id] = [annotation];
      }

      return newAnnotations;
    });
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

  useEffect(() => {
    setIsPdf(bookPath.endsWith(".pdf"));
  }, [bookPath]);

  return (
    <>
      <Menu
        hide={hide}
        title={book.media.metadata.title || ""}
        setEpubReaderOverviewModal={setEpubReaderOverviewModal}
      >
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
            onNewAnnotation={onNewAnnotation}
            menuItems={[
              { label: "Copy", key: "copy" },
              { label: "Highlight", key: "highlight" },
              { label: "Underline", key: "underline" },
              { label: "Squiggly", key: "squiggly" },
              { label: "Strikethrough", key: "strikethrough" },
            ]}
            onCustomMenuSelection={onCustomMenuSelection}
          />
        </FullScreen>
      </Menu>
      <BookChapterModal />
    </>
  );
};

export default memo(EBookReader);
