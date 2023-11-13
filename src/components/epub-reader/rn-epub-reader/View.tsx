import React, { useContext, useEffect, useRef } from "react";
import { I18nManager, useWindowDimensions, View as RNView } from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import Clipboard from "@react-native-clipboard/clipboard";
import RNFetchBlob from "rn-fetch-blob";

import { themes } from "../components/themes";

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
  menuItems,
  onCustomMenuSelection = () => {},
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
    setCurrentLocation,
    setMeta,
    theme,
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
      setMeta(book.metadata);
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
      setCurrentLocation({
        cfi,
        fraction,
        location,
        tocItem,
        pageItem,
        section,
        time,
      });
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

    if (type === "menuAction") {
      const { value } = parsedEvent;
      value && Clipboard.setString(value);
    }

    if (type === "newAnnotation") {
      const { annotation } = parsedEvent;
      onNewAnnotation(annotation);
    }

    if (type === "annotationClick") {
      const { index, range, value, pos } = parsedEvent;
      console.log(parsedEvent);
      onAnnotationClick({ index, value, pos });
    }
  };

  useEffect(() => {
    if (book.current) registerBook(book.current);
  }, [registerBook]);

  const leftFlingGesture = Gesture.Fling()
    .direction(I18nManager.isRTL ? Directions.LEFT : Directions.RIGHT)
    .onStart(() => {
      if (enableSwipe) {
        runOnJS(goPrevious)();
      }
    });

  const rightFlingGesture = Gesture.Fling()
    .direction(I18nManager.isRTL ? Directions.RIGHT : Directions.LEFT)
    .onStart(() => {
      if (enableSwipe) {
        runOnJS(goNext)();
      }
    });

  const tapGesture = Gesture.Tap().onTouchesUp((_event) => {
    const touch = _event.allTouches[0].absoluteX;
    const third = Math.floor(SCREEN_WIDTH / 3);
    if (enableSwipe) {
      if (touch < third) {
        console.log("go left");
        runOnJS(goPrevious)();
      } else if (touch > third && touch < third + third) {
        console.log("open menu");
        runOnJS(onPress)();
      } else {
        console.log("go right");
        runOnJS(goNext)();
      }
    } else {
      if (touch > third && touch < third + third) {
        runOnJS(onPress)();
      }
    }
  });

  const t = themes.find((th) => th.name === theme.theme);

  return (
    <GestureDetector
      gesture={Gesture.Race(tapGesture, rightFlingGesture, leftFlingGesture)}
    >
      <RNView
        style={{
          height: height,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: t?.bg,
          width: width,
        }}
      >
        <WebView
          ref={book}
          source={{ uri: templateUri }}
          showsVerticalScrollIndicator={false}
          webviewDebuggingEnabled={true}
          javaScriptEnabled={true}
          originWhitelist={["*"]}
          scrollEnabled={true}
          mixedContentMode="compatibility"
          onMessage={onMessage}
          allowingReadAccessToURL={`${allowedUris},${RNFetchBlob.fs.dirs.DocumentDir}`}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          allowFileAccess={true}
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          allowsLinkPreview={false}
          startInLoadingState={true}
          menuItems={menuItems}
          onCustomMenuSelection={onCustomMenuSelection}
          style={{
            width,
            overflow: "hidden",
            height,
            flex: 1,
            backgroundColor: t?.bg,
          }}
        />
      </RNView>
    </GestureDetector>
  );
}
