import { useEffect, useRef } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";

import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";

import BigAudioPlayer from "./components/big-audio-player";
import {
  AudiobookInfo,
  AudioPlayerInfo,
  SmallAudioPlayerWrapper,
} from "./components/small-audio-player";

const BUFFER = 40;
const HEADER_HEIGHT = 100;
export const Player = ({
  audiobookInfo,
  libraryItemId,
}: {
  libraryItemId: string;
  audiobookInfo: AudiobookInfo;
}) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const dimensions = useWindowDimensions();
  const insets = useAppSafeAreas();

  const animatedPosition = useSharedValue(0);

  const childrenStyles = useAnimatedStyle(() => {
    const opacityValue =
      interpolate(
        animatedPosition.value,
        [dimensions.height, dimensions.height - HEADER_HEIGHT - BUFFER],
        [0, 1]
      ) - 1;

    return {
      opacity: opacityValue,
    };
  });

  const headerStyles = useAnimatedStyle(() => {
    const opacityValue = interpolate(
      animatedPosition.value,
      [dimensions.height / 2, dimensions.height - HEADER_HEIGHT],
      [0, 1]
    );

    return {
      opacity: opacityValue,
      zIndex:
        animatedPosition.value < dimensions.height - HEADER_HEIGHT + BUFFER &&
        animatedPosition.value > dimensions.height / 2
          ? 100000
          : 0,
    };
  }, []);

  const setOpen = (op: boolean) => {
    if (op) {
      sheetRef.current?.snapToIndex(1);
    } else {
      sheetRef.current?.snapToIndex(0);
    }
  };

  useEffect(() => {
    sheetRef.current?.present();
    return sheetRef.current?.close();
  }, [sheetRef]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={[insets.bottom + HEADER_HEIGHT, "100%"]}
      enablePanDownToClose={false}
      activeOffsetY={[-1, 1]}
      failOffsetX={[-5, 5]}
      animatedPosition={animatedPosition}
      handleComponent={null}
      style={{
        backgroundColor: "transparent",
      }}
      backgroundStyle={{
        backgroundColor: "transparent",
      }}
    >
      <BottomSheetView
        style={{
          height: dimensions.height,
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              marginHorizontal: 0,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.46,
              shadowRadius: 11.14,

              elevation: 17,
            },
            headerStyles,
          ]}
        >
          <SmallAudioPlayerWrapper onPress={() => setOpen(true)}>
            <AudioPlayerInfo color="white" audiobookInfo={audiobookInfo} />
          </SmallAudioPlayerWrapper>
        </Animated.View>
        <Animated.View style={[childrenStyles]}>
          <BigAudioPlayer
            audiobookInfo={audiobookInfo}
            libraryItemId={libraryItemId}
            setOpen={setOpen}
          />
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
