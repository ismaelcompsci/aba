import Animated, { Keyframe } from "react-native-reanimated";
import TrackPlayer, { useIsPlaying } from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";

import { TouchableArea } from "../../touchable/touchable-area";

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
            <TouchableArea
              onPress={() => TrackPlayer.pause()}
              bg={"transparent"}
              h={"$4"}
              w={"$4"}
              borderRadius={"$12"}
              padding={"$0"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Pause size="$3.5" fill={color} />
            </TouchableArea>
          ) : (
            <TouchableArea
              borderRadius={"$12"}
              padding={"$0"}
              alignItems={"center"}
              justifyContent={"center"}
              bg={"$backgroundStrong"}
              h={"$7"}
              w={"$7"}
              onPress={() => TrackPlayer.pause()}
            >
              <Pause size="$3" fill={color} />
            </TouchableArea>
          )}
        </Animated.View>
      ) : (
        <Animated.View
          key="play"
          entering={EnterActionButton.duration(150)}
          exiting={ExitActionButton.duration(150)}
        >
          {small ? (
            <TouchableArea
              onPress={() => TrackPlayer.play()}
              bg={"transparent"}
              borderRadius={"$12"}
              padding={"$0"}
              alignItems={"center"}
              justifyContent={"center"}
              h={"$4"}
              w={"$4"}
            >
              <Play size="$3.5" fill={color} />
            </TouchableArea>
          ) : (
            <TouchableArea
              bg={"$backgroundStrong"}
              borderRadius={"$12"}
              padding={"$0"}
              alignItems={"center"}
              justifyContent={"center"}
              h={"$7"}
              w={"$7"}
              onPress={() => TrackPlayer.play()}
            >
              <Play size="$3" fill={color} />
            </TouchableArea>
          )}
        </Animated.View>
      )}
    </>
  );
};
