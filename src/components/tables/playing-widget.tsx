import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { State, usePlaybackState } from "react-native-track-player";

import { Flex } from "../layout/flex";

const FIRST_HEIGHT_BAR = 30;

const PlayingWidget = ({
  initalHeight = FIRST_HEIGHT_BAR,
}: {
  initalHeight?: number;
}) => {
  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const height = useSharedValue(0);
  const otherHeight = useSharedValue(0);

  const first = initalHeight;
  const third = initalHeight - 10;
  const fourth = initalHeight / 2;

  useEffect(() => {
    height.value = withRepeat(withTiming(1, { duration: 400 }), Infinity, true);
    otherHeight.value = withRepeat(
      withTiming(1, { duration: 300 }),
      Infinity,
      true
    );
  }, []);

  const firstBarStyle = useAnimatedStyle(
    () => ({
      height: isPlaying
        ? interpolate(otherHeight.value, [0, 1], [7, first])
        : withTiming(1, { duration: 400 }),
    }),
    [isPlaying]
  );
  const secondBarStyle = useAnimatedStyle(
    () => ({
      height: isPlaying
        ? interpolate(
            height.value,
            [0, 1],
            [10, (otherHeight.value + height.value) * 10],
            {
              extrapolateLeft: Extrapolation.CLAMP,
            }
          )
        : withTiming(1, { duration: 400 }),
    }),
    [isPlaying]
  );
  const thirdBarStyle = useAnimatedStyle(
    () => ({
      height: isPlaying
        ? interpolate(otherHeight.value, [0, 1], [height.value * 10, third]) +
          height.value * 10
        : withTiming(1, { duration: 400 }),
    }),
    [isPlaying]
  );
  const fourthBarStyle = useAnimatedStyle(
    () => ({
      height: isPlaying
        ? interpolate(height.value, [0, 1], [otherHeight.value * 10, fourth], {
            extrapolateLeft: Extrapolation.CLAMP,
          })
        : withTiming(1, { duration: 400 }),
    }),
    [isPlaying]
  );

  return (
    <Flex centered row space="$1">
      <Animated.View style={[styles.bar, thirdBarStyle]} />
      <Animated.View style={[styles.bar, firstBarStyle]} />
      <Animated.View style={[styles.bar, secondBarStyle]} />
      <Animated.View style={[styles.bar, thirdBarStyle]} />
      <Animated.View style={[styles.bar, firstBarStyle]} />
      <Animated.View style={[styles.bar, fourthBarStyle]} />
      <Animated.View style={[styles.bar, thirdBarStyle]} />
    </Flex>
  );
};
const styles = StyleSheet.create({
  bar: {
    width: 2,
    backgroundColor: "green",
    borderRadius: 4,
  },
});

export default PlayingWidget;
