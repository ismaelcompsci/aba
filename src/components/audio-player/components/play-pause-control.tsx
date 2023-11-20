import Animated, { Keyframe } from "react-native-reanimated";
import TrackPlayer, { useIsPlaying } from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";

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
  color,
  small = true,
}: {
  color: string;
  small?: boolean;
}) => {
  const { playing } = useIsPlaying();

  return (
    <>
      {playing ? (
        <Animated.View
          key="pause"
          entering={EnterActionButton.duration(150)}
          exiting={ExitActionButton.duration(150)}
          style={{ zIndex: 10000 }}
        >
          {small ? (
            <CirlceButton
              onPress={() => TrackPlayer.pause()}
              onTouchEnd={(ev) => ev.stopPropagation()}
              bg={"transparent"}
              h={"$4"}
              w={"$4"}
              pressStyle={{
                bg: "transparent",
                borderWidth: 0,
              }}
            >
              <Pause size="$3.5" fill={color} />
            </CirlceButton>
          ) : (
            <CirlceButton
              bg={"$backgroundStrong"}
              h={"$7"}
              w={"$7"}
              onPress={() => TrackPlayer.pause()}
              onTouchEnd={(ev) => ev.stopPropagation()}
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
            <CirlceButton
              onTouchEnd={(ev) => ev.stopPropagation()}
              onPress={() => TrackPlayer.play()}
              bg={"transparent"}
              h={"$4"}
              w={"$4"}
              pressStyle={{
                bg: "transparent",
                borderWidth: 0,
              }}
            >
              <Play size="$3.5" fill={color} />
            </CirlceButton>
          ) : (
            <CirlceButton
              bg={"$backgroundStrong"}
              h={"$7"}
              w={"$7"}
              onPress={() => TrackPlayer.play()}
              onTouchEnd={(ev) => ev.stopPropagation()}
            >
              <Play size="$3" fill={color} />
            </CirlceButton>
          )}
        </Animated.View>
      )}
    </>
  );
};
