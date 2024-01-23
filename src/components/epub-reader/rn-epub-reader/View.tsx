import React, { useContext, useEffect, useRef } from "react";
import { I18nManager, useWindowDimensions, View as RNView } from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureType,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Clipboard from "@react-native-clipboard/clipboard";
import RNFetchBlob from "rn-fetch-blob";

import { ReaderContext } from "./context";
import type { ReaderProps } from "./types";

export type ViewProps = Omit<ReaderProps, "src" | "fileSystem"> & {
  templateUri: string;
  allowedUris: string;
};

export function View({
  templateUri,
  allowedUris,
  onStarted = () => {},
  onPress = () => {},
  onDisplayError = () => {},
  onShowNext = () => {},
  onShowPrevious = () => {},
  onReady = () => {},
  onLocationChange = () => {},
  enableSwipe = false,
  width,
  height,
  defaultTheme,
  onDeleteAnnotation = () => {},
  onNewAnnotation = () => {},
  onAnnotationClick = () => {},
}: ViewProps) {
  const {
    registerBook,
    setIsRendering,
    goNext,
    goPrevious,
    changeTheme,
    setCover,
    isPdf,
  } = useContext(ReaderContext);
  const book = useRef<WebView>(null);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const onMessage = (event: WebViewMessageEvent) => {
    const parsedEvent = JSON.parse(event.nativeEvent.data);

    const { type } = parsedEvent;

    delete parsedEvent.type;

    if (type === "epubjs") {
      console.log("[JS]", parsedEvent.message);
    }

    if (type === "pressEvent") {
      const { touch, isSelecting, duration, touchStart } = parsedEvent;

      const endTouch = JSON.parse(touch);
      const startTouch = touchStart;
      const endTouchX = endTouch.x;
      const endTouchY = endTouch.y;
      const startTouchX = startTouch.x;
      const startTouchY = startTouch.y;

      const xDiff = Math.abs(startTouchX - endTouchX);
      const yDiff = Math.abs(startTouchY - endTouchY);

      const MAX_DIFF = 10;

      const thirdOfScreen = Math.floor(SCREEN_WIDTH / 3);

      if (
        endTouchX > thirdOfScreen &&
        endTouchX < thirdOfScreen + thirdOfScreen &&
        !isSelecting &&
        xDiff < MAX_DIFF &&
        yDiff < MAX_DIFF
      ) {
        viewPress();
      }
    }
    if (type === "onStarted") {
      setIsRendering(true);

      return onStarted();
    }

    if (type === "onDisplayError") {
      const { reason } = parsedEvent;
      setIsRendering(false);

      return onDisplayError(reason);
    }

    if (type === "onReady") {
      const { book } = parsedEvent;
      if (defaultTheme) {
        changeTheme(defaultTheme);
      }
      setIsRendering(false);
      onReady(book);
    }

    if (type === "showNext") {
      const { show, label } = parsedEvent;
      onShowNext(show, label);
    }

    if (type === "showPrevious") {
      const { show, label } = parsedEvent;
      onShowPrevious(show, label);
    }

    if (type === "cover") {
      const { cover } = parsedEvent;
      setCover(cover);
    }

    if (type === "onLocationChange") {
      const { cfi, fraction, location, tocItem, pageItem, section, time } =
        parsedEvent;
      onLocationChange({
        cfi,
        fraction,
        location,
        tocItem,
        pageItem,
        section,
        time,
      });
    }

    if (type === "copyAction") {
      const { value } = parsedEvent;
      value && Clipboard.setString(value);
    }

    if (type === "newAnnotation") {
      const { annotation } = parsedEvent;
      onNewAnnotation(annotation);
    }

    if (type === "annotationClick") {
      const { index, value, pos, isNew } = parsedEvent;
      onAnnotationClick({ index, value, pos, isNew });
    }

    if (type === "deleteAnnotation") {
      const { annotation } = parsedEvent;
      onDeleteAnnotation(annotation);
    }
  };

  useEffect(() => {
    if (book.current) registerBook(book.current);
  }, [registerBook]);

  const leftFlingGesture = Gesture.Fling()
    .direction(I18nManager.isRTL ? Directions.LEFT : Directions.RIGHT)
    .onEnd(() => {
      if (enableSwipe) {
        runOnJS(goPrevious)();
      }
    });

  const rightFlingGesture = Gesture.Fling()
    .direction(I18nManager.isRTL ? Directions.RIGHT : Directions.LEFT)
    .onEnd(() => {
      if (enableSwipe) {
        runOnJS(goNext)();
      }
    });

  const viewPress = () => {
    setTimeout(() => {
      onPress();
    }, 130);
  };

  return (
    <PDFGestureDetector
      isPdf={isPdf}
      gestures={[leftFlingGesture, rightFlingGesture]}
    >
      <RNView
        style={{
          height: height,
          justifyContent: "center",
          alignItems: "center",
          width: width,
        }}
      >
        <WebView
          ref={book}
          source={{ uri: templateUri }}
          showsVerticalScrollIndicator={false}
          webviewDebuggingEnabled={true}
          incognito={true}
          cacheMode="LOAD_NO_CACHE"
          cacheEnabled={false}
          javaScriptEnabled={true}
          originWhitelist={["*"]}
          scrollEnabled={false}
          mixedContentMode="compatibility"
          onMessage={onMessage}
          allowingReadAccessToURL={RNFetchBlob.fs.dirs.DocumentDir}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          allowFileAccess={true}
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          allowsLinkPreview={false}
          startInLoadingState={true}
          // menuItems={menuItems}
          // onCustomMenuSelection={onCustomMenuSelection}

          style={{
            width,
            overflow: "hidden",
            height,
            flex: 1,
          }}
        />
      </RNView>
    </PDFGestureDetector>
  );
}

const PDFGestureDetector = ({
  children,
  isPdf,
  gestures,
}: {
  children: React.ReactNode;
  isPdf: boolean;
  gestures: GestureType[];
}) => {
  if (isPdf) {
    return (
      <GestureDetector gesture={Gesture.Race(...gestures)}>
        {children}
      </GestureDetector>
    );
  } else return children;
};
