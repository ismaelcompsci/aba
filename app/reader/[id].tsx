import { useAtomValue } from "jotai/react";
import { Stack, Text, XStack, YStack } from "tamagui";
import { currentItemAtom } from "../../utils/atoms";
import { useEffect, useState } from "react";
import { GestureResponderEvent, TouchableWithoutFeedback } from "react-native";

import { SafeAreaView, useWindowDimensions } from "react-native";
// import { Reader, ReaderProvider } from "@epubjs-react-native/core";

import { useFileSystem } from "@epubjs-react-native/expo-file-system"; // for Expo project
import { Reader, ReaderProvider } from "../../components/EpubReader";

const ReaderPage = () => {
  const { width, height } = useWindowDimensions();
  const currentItem = useAtomValue(currentItemAtom);

  const [touchId, setTouchId] = useState("");

  // const [touchStartTime, setTouchTimeStart] = useState(0);
  // const [touchStartX, setTouchTimeStartX] = useState(0);
  // const [touchStartY, setTouchTimeStartY] = useState(0);

  // const [touchEndX, setTouchTimeEndX] = useState(0);
  // const [touchEndY, setTouchTimeEndY] = useState(0);

  const [hide, setHide] = useState(false);

  // const handleGesture = () => {};

  // const handleShowPressIn = (event: GestureResponderEvent) => {
  //   if (touchStartTime && Date.now() - touchStartTime < 250) {
  //     return;
  //   }

  //   setTouchId(event.nativeEvent.identifier);
  //   setTouchTimeStartX(event.nativeEvent.locationX);
  //   setTouchTimeStartY(event.nativeEvent.locationY);
  //   setTouchTimeStart(Date.now());
  // };
  // const handleShowPressOut = (event: GestureResponderEvent) => {
  //   if (touchId !== event.nativeEvent.identifier) {
  //     return;
  //   }

  //   setTouchTimeEndX(event.nativeEvent.locationX);
  //   setTouchTimeEndY(event.nativeEvent.locationY);
  //   setHide((prev) => !prev);
  //   console.log("hello");
  // };

  useEffect(() => {
    console.log(currentItem);
  }, [currentItem]);

  if (!currentItem) {
    return null;
  }

  return (
    <YStack h={"100%"} w={"100%"} bg={"$background"} pos={"relative"}>
      <ReaderProvider>
        {/* <TouchableWithoutFeedback
        onPressIn={handleShowPressIn}
        onPressOut={handleShowPressOut}
      > */}
        <YStack
          pos={"relative"}
          h={"100%"}
          w={"100%"}
          alignItems="center"
          justifyContent="center"
        >
          {hide && (
            <XStack
              zIndex={50}
              w={"100%"}
              bg={"black"}
              top={0}
              h={"$7"}
              pos={"absolute"}
            >
              <Text>TOP</Text>
            </XStack>
          )}

          {/* reader */}
          <Reader
            onPress={() => setHide((prev) => !prev)}
            src="https://s3.amazonaws.com/moby-dick/OPS/package.opf"
            width={width}
            height={height}
            fileSystem={useFileSystem}
          />

          {hide && (
            <XStack
              zIndex={50}
              w={"100%"}
              bg={"black"}
              bottom={0}
              h={"$7"}
              pos={"absolute"}
            >
              <Text>Bottom</Text>
            </XStack>
          )}
        </YStack>
        {/* </TouchableWithoutFeedback> */}
      </ReaderProvider>
    </YStack>
  );
};

export default ReaderPage;
