import { memo, useEffect, useMemo, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import axios from "axios";
import * as Burnt from "burnt";
import { router } from "expo-router";
import { useAtom, useSetAtom } from "jotai";

import { IS_ANDROID } from "../../constants/consts";
import {
  epubReaderBookMetadataAtom,
  epubReaderCurrentLocationAtom,
  epubReaderLoadingAtom,
  epubReaderMenuInlineSizeAtom,
  epubReaderSectionFractionsAtom,
  epubReaderShowMenuAtom,
  epubReaderTocAtom,
} from "../../state/epub-reader-state";
import { bookAnnotationsAtom } from "../../state/local-state";
import { LibraryItemExpanded } from "../../types/aba";
import { awaitTimeout } from "../../utils/utils";

import { readerPopoverMenuAtom } from "./components/reader-popover-menu";
import {
  Annotation,
  BookAnnotations,
  LocationChange,
  Reader,
  ReaderBook,
  ShowAnnotation,
  Theme,
  useReader,
} from "./rn-epub-reader";

interface EBookReaderProps {
  book: LibraryItemExpanded;
  serverAddress: string;
  bookPath: string;
  userToken: string;
  userId: string;
  initialLocation: string | undefined;
  ebookSettings: Theme;
}

const MENU_ITEMS = [
  { label: "Copy", key: "copy" },
  { label: "Highlight", key: "highlight" },
  { label: "Underline", key: "underline" },
  { label: "Squiggly", key: "squiggly" },
  { label: "Strikethrough", key: "strikethrough" },
];

if (IS_ANDROID) {
  MENU_ITEMS.unshift({ label: "x", key: "x" });
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
  ebookSettings,
}: EBookReaderProps) => {
  const { width, height } = useWindowDimensions();

  const [bookAnnotations, setBookAnnotations] = useAtom(bookAnnotationsAtom);
  const setEpubReaderLoading = useSetAtom(epubReaderLoadingAtom);
  const setEpubReaderToc = useSetAtom(epubReaderTocAtom);

  const setEpubReaderShowMenu = useSetAtom(epubReaderShowMenuAtom);
  const setCurrentLocation = useSetAtom(epubReaderCurrentLocationAtom);
  const setEpubReaderSectionFractions = useSetAtom(
    epubReaderSectionFractionsAtom
  );
  const setEpubReaderBookMetadata = useSetAtom(epubReaderBookMetadataAtom);
  const setReaderPopoverMenu = useSetAtom(readerPopoverMenuAtom);
  const setEpubReaderMenuInlineSize = useSetAtom(epubReaderMenuInlineSizeAtom);
  const [ready, setReady] = useState(false);

  const { setIsPdf, setAnnotations } = useReader();

  const isPdf = useMemo(
    () => bookPath.endsWith(".pdf") || bookPath.endsWith("cbz"),
    [bookPath]
  );

  const annotationKey = `${book.id}-${userId}`;

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
    setEpubReaderBookMetadata(readyBook.metadata);
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

  const onDeleteAnnotation = (annotation: Annotation) => {
    setBookAnnotations((prev) => {
      const newAnnotations = { ...prev };
      const filteredAnnotations = newAnnotations[annotationKey]?.filter(
        (anns) => anns.value !== annotation.value
      );

      if (filteredAnnotations && newAnnotations[annotationKey]?.length >= 0) {
        newAnnotations[annotationKey] = filteredAnnotations;
      } else {
        newAnnotations[annotationKey] = [];
      }

      return newAnnotations;
    });
  };

  const onAnnotationClick = ({ pos, isNew }: ShowAnnotation) => {
    setReaderPopoverMenu({ open: true, ...pos.point, isNew });
  };

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
    return () => {
      setEpubReaderShowMenu(false);
      StatusBar.setHidden(false);
    };
  }, []);

  useEffect(() => {
    setEpubReaderMenuInlineSize(width);
  }, [width]);

  useEffect(() => {
    setIsPdf(bookPath.endsWith(".pdf") || bookPath.endsWith("cbz"));
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
        defaultTheme={ebookSettings}
        onLocationChange={onLocationChange}
        onStarted={() =>
          setEpubReaderLoading({ loading: true, part: "Opening Book..." })
        }
        onReady={onReady}
        onDisplayError={onDisplayError}
        onNewAnnotation={onNewAnnotation}
        onAnnotationClick={onAnnotationClick}
        onDeleteAnnotation={onDeleteAnnotation}
      />
    </>
  );
};

export default memo(EBookReader);
