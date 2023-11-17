import { memo, useEffect, useRef, useState } from "react";
import { Platform, StatusBar, useWindowDimensions } from "react-native";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { Settings } from "@tamagui/lucide-icons";
import axios from "axios";
import * as Burnt from "burnt";
import { router } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button } from "tamagui";

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
  ShowAnnotation,
  useReader,
} from "./rn-epub-reader";

interface EBookReaderProps {
  book: LibraryItemExpanded;
  user: User;
  serverAddress: string;
  bookPath: string;
  initialLocation: string | undefined;
}
/**
 * Possible Issues / Fixes / TODOS
 * Dismiss ActionMode for android on view press -> https://stackoverflow.com/a/77408989
 *
 * Touch events for open menu and pdf swiping inside webview. because android is bad
 */

const EBookReader = ({
  book,
  user,
  serverAddress,
  bookPath,
  initialLocation,
}: EBookReaderProps) => {
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

  const op = useRef(false);
  const { setIsPdf, useMenuAction, setAnnotations, openMenu } = useReader();

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
    if (op.current) return;
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
      case "speak_from_here":
        useMenuAction({ action: "speak_from_here" });
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
      const filteredNewAnnotaions = newAnnotations[book.id]?.filter(
        (anns) => anns.value !== annotation.value
      );

      if (filteredNewAnnotaions && newAnnotations[book.id]?.length >= 0) {
        filteredNewAnnotaions.push(annotation);
        newAnnotations[book.id] = filteredNewAnnotaions;
      } else {
        newAnnotations[book.id] = [annotation];
      }

      return newAnnotations;
    });
  };

  const onAnnotationClick = ({ pos }: ShowAnnotation) => {
    op.current = true;
    openMenu({ x: pos.point.x, y: pos.point.y });
  };

  // const annotationAction = (action: string) => {
  //   if (action === "delete") {
  //     const filteredAnnotations = bookAnnotations[book.id].filter(
  //       (an) => an.value !== annotaionOpen.value
  //     );
  //     setBookAnnotations((prev: BookAnnotations) => {
  //       const newAnnotaions = { ...prev };
  //       newAnnotaions[book.id] = filteredAnnotations;
  //       return newAnnotaions;
  //     });
  //   }
  // };

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

  const ReaderFullScreenPress = () => {
    op.current = false;
  };

  return (
    <ReaderFullscreen
      onPress={Platform.OS === "ios" ? ReaderFullScreenPress : undefined}
    >
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
        onAnnotationClick={onAnnotationClick}
        menuItems={[
          { label: "Copy", key: "copy" },
          { label: "Highlight", key: "highlight" },
          { label: "Underline", key: "underline" },
          { label: "Squiggly", key: "squiggly" },
          { label: "Strikethrough", key: "strikethrough" },
          { label: "Speak from here", key: "speak_from_here" },
        ]}
        onCustomMenuSelection={onCustomMenuSelection}
      />
      <Menu
        hide={hide}
        title={book.media.metadata.title || ""}
        setEpubReaderOverviewModal={setEpubReaderOverviewModal}
      />
      <BookChapterModal />
      {Platform.OS === "android" ? (
        <Button
          circular
          pos={"absolute"}
          bottom={10}
          right={15}
          zIndex={9999}
          ai={"center"}
          jc={"center"}
          onPress={() => setHide((prev) => !prev)}
          icon={() => <Settings />}
        />
      ) : null}
    </ReaderFullscreen>
  );
};

const ReaderFullscreen = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) => {
  if (Platform.OS === "ios") {
    return <FullScreen onPress={onPress}>{children}</FullScreen>;
  } else {
    return children;
  }
};

export default memo(EBookReader);
