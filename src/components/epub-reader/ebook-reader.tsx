import { memo, useEffect, useMemo, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import axios from "axios";
import * as Burnt from "burnt";
import { router } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { epubReaderMenuInlineSizeAtom } from "../../app/reader/_layout";
import {
  epubReaderCurrentLocationAtom,
  epubReaderLoadingAtom,
  epubReaderSectionFractionsAtom,
  epubReaderShowMenuAtom,
  epubReaderTocAtom,
} from "../../state/app-state";
import {
  bookAnnotationsAtom,
  ebookSettignsAtom,
} from "../../state/local-state";
import { LibraryItemExpanded } from "../../types/aba";
import { awaitTimeout } from "../../utils/utils";

import { BookChapterModal } from "./components/book-modal";
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
  serverAddress: string;
  bookPath: string;
  userToken: string;
  userId: string;
  initialLocation: string | undefined;
}
/**
 * Possible Issues / Fixes / TODOS
 * Dismiss ActionMode for android on view press -> https://stackoverflow.com/a/77408989
 *
 * Touch events for open menu and pdf swiping inside webview. because android is bad
 *
 *
 * TODO
 * fix scrolling mode
 *
 * rebuild the touch system
 * open menu stuff
 */

const EBookReader = ({
  book,
  serverAddress,
  bookPath,
  initialLocation,
  userId,
  userToken,
}: EBookReaderProps) => {
  const { width, height } = useWindowDimensions();

  const [bookAnnotations, setBookAnnotations] = useAtom(bookAnnotationsAtom);
  const setEpubReaderLoading = useSetAtom(epubReaderLoadingAtom);
  const setEpubReaderToc = useSetAtom(epubReaderTocAtom);
  const ebookSettings = useAtomValue(ebookSettignsAtom);
  const setEpubReaderShowMenu = useSetAtom(epubReaderShowMenuAtom);
  const setCurrentLocation = useSetAtom(epubReaderCurrentLocationAtom);
  const setEpubReaderSectionFractions = useSetAtom(
    epubReaderSectionFractionsAtom
  );
  const setEpubReaderMenuInlineSize = useSetAtom(epubReaderMenuInlineSizeAtom);
  const [ready, setReady] = useState(false);

  const { setIsPdf, useMenuAction, setAnnotations, openMenu } = useReader();

  const isPdf = useMemo(() => bookPath.endsWith(".pdf"), [bookPath]);

  const annotationKey = `${book.id}-${userId}`;

  const defaultTheme = useMemo(() => ebookSettings, []);

  const onReady = async (readyBook: ReaderBook) => {
    const annotations = bookAnnotations[annotationKey];
    if (annotations) setAnnotations(annotations);

    setEpubReaderToc(readyBook.toc);
    setEpubReaderSectionFractions(readyBook.sectionFractions);
    setEpubReaderLoading({
      loading: true,
      part: "Opening Book...",
      percent: 1,
    });
    await awaitTimeout(100);
    setEpubReaderLoading({ loading: false });
    setReady(true);
  };

  const onPress = () => {
    setEpubReaderShowMenu((p) => !p);
  };

  const onDisplayError = (reason: string) => {
    Burnt.toast({
      preset: "error",
      title: reason,
    });
    setEpubReaderLoading({ loading: false });
    router.back();
  };

  const onLocationChange = (location: LocationChange) => {
    setCurrentLocation(location);
    if (!ready) return;
    let payload;
    if (!isPdf) {
      payload = {
        ebookLocation: location.cfi,
        ebookProgress: location.fraction,
      };
    } else {
      payload = {
        ebookLocation: location.section.current,
        ebookProgress: location.fraction,
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
        useMenuAction({ action: "strikethrough", color: "strikethrough" });
        break;
      case "squiggly":
        useMenuAction({ action: "squiggly", color: "squiggly" });
        break;
      case "underline":
        useMenuAction({ action: "underline", color: "underline" });
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
      const filteredNewAnnotaions = newAnnotations[annotationKey]?.filter(
        (anns) => anns.value !== annotation.value
      );

      if (filteredNewAnnotaions && newAnnotations[annotationKey]?.length >= 0) {
        filteredNewAnnotaions.push(annotation);
        newAnnotations[annotationKey] = filteredNewAnnotaions;
      } else {
        newAnnotations[annotationKey] = [annotation];
      }

      return newAnnotations;
    });
  };

  const onAnnotationClick = ({ pos }: ShowAnnotation) => {
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
          Authorization: `Bearer ${userToken}`,
        },
      });
    } catch (error) {
      console.log("[EBOOKREADER] Update progress error", error);
    }
  };

  useEffect(() => {
    // StatusBar.setHidden(!hide);
    return () => StatusBar.setHidden(false);
  }, []);

  useEffect(() => {
    setEpubReaderMenuInlineSize(width);
  }, [width]);

  useEffect(() => {
    setIsPdf(bookPath.endsWith(".pdf"));
  }, [bookPath]);

  return (
    <>
      <Reader
        height={height}
        width={width}
        src={bookPath}
        enableSwipe={isPdf}
        fileSystem={useFileSystem}
        onPress={onPress}
        initialLocation={initialLocation}
        defaultTheme={defaultTheme}
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
        ]}
        onCustomMenuSelection={onCustomMenuSelection}
      />
      <BookChapterModal />
    </>
  );
};

export default memo(EBookReader);
