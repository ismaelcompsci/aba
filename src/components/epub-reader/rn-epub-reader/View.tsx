import React, { useContext, useEffect, useRef } from "react";
import { I18nManager, useWindowDimensions, View as RNView } from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureTouchEvent,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { WebView, WebViewMessageEvent } from "react-native-webview";
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
}: ViewProps) {
  const {
    registerBook,
    setIsRendering,
    goNext,
    goPrevious,
    theme,
    changeTheme,
  } = useContext(ReaderContext);
  const book = useRef<WebView>(null);
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();

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

    if (type === "onLocationChange") {
      const { cfi, fraction, location, tocItem, pageItem, section } =
        parsedEvent;
      onLocationChange({ cfi, fraction, location, tocItem, pageItem, section });
    }
  };

  useEffect(() => {
    if (book.current) registerBook(book.current);
  }, [registerBook]);

  const centerOfScreenVertical = (e: GestureTouchEvent) => {
    const third = SCREEN_HEIGHT / 3;
    const start = third;
    const end = third + third;

    const touch = e.allTouches[0];
    const touchY = touch.absoluteY;

    return touchY > start && touchY < end;
  };

  const centerOfScreenHorizontal = (e: GestureTouchEvent) => {
    const third = SCREEN_WIDTH / 3;
    const start = third;
    const end = third + third;

    const touch = e.allTouches[0];
    const touchX = touch.absoluteX;

    if (touchX > start && touchX < end) {
      onPress();
    }
  };

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
    runOnJS(centerOfScreenHorizontal)(_event);
  });

  const t = themes.find((th) => th.name === theme.theme);

  /**
   * TODO figure out the white flash
   * and stop it from happenings
   * only send onReady when book is rendered in html
   */
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
