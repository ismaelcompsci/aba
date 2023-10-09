import React, { useContext, useEffect, useRef } from "react";
import { View as RNView, useWindowDimensions } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureTouchEvent,
} from "react-native-gesture-handler";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { defaultTheme as initialTheme, ReaderContext } from "./context";
import type { ReaderProps } from "./types";
import { Spinner, YStack } from "tamagui";
import RNFetchBlob from "rn-fetch-blob";

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
  width,
  height,
}: ViewProps) {
  const { registerBook, theme, setIsRendering } = useContext(ReaderContext);
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
      console.log(reason);
      setIsRendering(false);

      return onDisplayError(reason);
    }

    if (type === "onReady") {
      setIsRendering(false);
    }

    if (type === "showNext") {
      const { show, label } = parsedEvent;
      onShowNext(show, label);
    }
    if (type === "showPrevious") {
      const { show, label } = parsedEvent;
      onShowPrevious(show, label);
    }

    return () => {};
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

    return touchX > start && touchX < end;
  };

  const tapGesture = Gesture.Tap().onTouchesUp((_event) => {
    const isValid = centerOfScreenHorizontal(_event);

    if (isValid) {
      onPress();
    }
  });

  /**
   * TODO figure out the white flash
   * and stop it from happenings
   * only send onReady when book is rendered in html
   */
  return (
    <GestureDetector gesture={Gesture.Exclusive(tapGesture)}>
      <RNView
        style={{
          height: height,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.backgroundColor,
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
          allowingReadAccessToURL={
            allowedUris +
            `,${RNFetchBlob.fs.dirs.DocumentDir},${RNFetchBlob.fs.dirs.MainBundleDir}`
          }
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          allowFileAccess={true}
          bounces={false}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          allowsLinkPreview={false}
          startInLoadingState={true}
          renderLoading={() => {
            return <LoadingFileComponent />;
          }}
          style={{
            width,
            overflow: "hidden",
            height,
            flex: 1,
            backgroundColor: theme.backgroundColor,
          }}
        />
      </RNView>
    </GestureDetector>
  );
}

const LoadingFileComponent = () => {
  return (
    <YStack
      bg={"#111"}
      h={"100%"}
      w={"100%"}
      alignItems="center"
      justifyContent="center"
    >
      <Spinner />
    </YStack>
  );
};
