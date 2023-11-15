import { memo, useEffect, useRef, useState } from "react";
import { StatusBar, useWindowDimensions } from "react-native";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import axios from "axios";
import * as Burnt from "burnt";
import { router } from "expo-router";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button, Group, Popover, Text } from "tamagui";

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
  const [annotaionOpen, setAnnotaionOpen] = useState({
    open: false,
    x: 0,
    y: 0,
    dir: "",
    index: -1,
    value: "",
  });
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
    console.log(event.nativeEvent);
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
      const filteredNewAnnotaions = newAnnotations[book.id].filter(
        (anns) => anns.value !== annotation.value
      );

      if (newAnnotations[book.id]?.length >= 0) {
        filteredNewAnnotaions.push(annotation);
        newAnnotations[book.id] = filteredNewAnnotaions;
      } else {
        newAnnotations[book.id] = [annotation];
      }

      return newAnnotations;
    });
  };

  const onAnnotationClick = ({ index, pos, value }: ShowAnnotation) => {
    op.current = true;
    // setAnnotaionOpen({
    //   open: true,
    //   x: pos.point.x,
    //   y: pos.point.y,
    //   dir: pos.dir,
    //   value,
    //   index,
    // });
    openMenu({ x: pos.point.x, y: pos.point.y });
  };

  const annotationAction = (action: string) => {
    if (action === "delete") {
      const filteredAnnotations = bookAnnotations[book.id].filter(
        (an) => an.value !== annotaionOpen.value
      );
      setBookAnnotations((prev: BookAnnotations) => {
        const newAnnotaions = { ...prev };
        newAnnotaions[book.id] = filteredAnnotations;
        return newAnnotaions;
      });
    }
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
        <FullScreen
          pos="absolute"
          t={0}
          b={0}
          r={0}
          l={0}
          onPress={() => (op.current = false)}
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
            ]}
            onCustomMenuSelection={onCustomMenuSelection}
          />
          {/* <Popover
            open={annotaionOpen.open}
            stayInFrame
            strategy="absolute"
            placement="bottom"
            onOpenChange={(open) => {
              setAnnotaionOpen({
                open,
                x: 0,
                y: 0,
                dir: "",
                index: -1,
                value: "",
              });
              op.current = false;
            }}
          >
            <Popover.Content
              position="absolute"
              y={
                annotaionOpen.dir === "up"
                  ? annotaionOpen.y + 25
                  : annotaionOpen.y
              }
              x={60}
              p={0}
              bg={"transparent"}
            >
              <Popover.ScrollView horizontal>
                <Group
                  orientation="horizontal"
                  onLayout={(event) => {
                    const groupWidth = event.nativeEvent.layout.width;
                    setAnnotaionOpen((prev) => ({
                      ...prev,
                      x: width / 2 - groupWidth / 2,
                    }));
                  }}
                  size={"$1"}
                >
                  <Group.Item>
                    <Button onPress={() => annotationAction("delete")}>
                      <Text>Delete</Text>
                    </Button>
                  </Group.Item>
                  <Group.Item>
                    <Button onPress={() => annotationAction("underline")}>
                      <Text>Underline</Text>
                    </Button>
                  </Group.Item>
                  <Group.Item>
                    <Button onPress={() => annotationAction("strikethrough")}>
                      <Text>Strikethrough</Text>
                    </Button>
                  </Group.Item>
                </Group>
              </Popover.ScrollView>
            </Popover.Content>
          </Popover> */}
        </FullScreen>
      </Menu>
      <BookChapterModal />
    </>
  );
};

export default memo(EBookReader);
