import Animated, { Keyframe } from "react-native-reanimated";
import TrackPlayer from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";
import { View } from "tamagui";

import { CirlceButton } from "./circle-button";

const ExitActionButton = new Keyframe({
  0: {
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  50: {
    transform: [{ scale: 0.5 }],
    opacity: 0.5,
  },
  100: {
    transform: [{ scale: 0 }],
    opacity: 0,
  },
});

const EnterActionButton = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
    opacity: 0,
  },
  50: {
    transform: [{ scale: 0.5 }],
    opacity: 0.5,
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
  },
});

export const PlayPauseControl = ({
  playing,
  color,
  small = true,
}: {
  playing: boolean;
  color: string;
  small?: boolean;
}) => {
  return (
    <>
      {playing ? (
        <Animated.View
          key="pause"
          entering={EnterActionButton.duration(150)}
          exiting={ExitActionButton.duration(150)}
        >
          {small ? (
            <View onPress={() => TrackPlayer.pause()}>
              <Pause size="$3.5" fill={color} />
            </View>
          ) : (
            <CirlceButton
              bg={"$backgroundStrong"}
              h={"$7"}
              w={"$7"}
              onPress={() => TrackPlayer.pause()}
            >
              <Pause size="$3" fill={color} />
            </CirlceButton>
          )}
        </Animated.View>
      ) : (
        <Animated.View
          key="play"
          entering={EnterActionButton.duration(150)}
          exiting={ExitActionButton.duration(150)}
        >
          {small ? (
            <View onPress={() => TrackPlayer.play()}>
              <Play size="$3.5" fill={color} />
            </View>
          ) : (
            <CirlceButton
              bg={"$backgroundStrong"}
              h={"$7"}
              w={"$7"}
              onPress={() => TrackPlayer.play()}
            >
              <Play size="$3" fill={color} />
            </CirlceButton>
          )}
        </Animated.View>
      )}
    </>
  );
};
