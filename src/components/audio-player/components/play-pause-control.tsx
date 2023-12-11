import { Keyframe } from "react-native-reanimated";
import TrackPlayer, { useIsPlaying } from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";

import { AnimatedFlex } from "../../layout/flex";
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
        <AnimatedFlex
          key="pause"
          entering={EnterActionButton.duration(150)}
          exiting={ExitActionButton.duration(150)}
          style={{ zIndex: 10000 }}
        >
          {small ? (
            <TouchableArea
              onPress={() => TrackPlayer.pause()}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Pause size="$3.5" fill={color} />
            </TouchableArea>
          ) : (
            <TouchableArea
              alignItems={"center"}
              justifyContent={"center"}
              onPress={() => TrackPlayer.pause()}
            >
              <Pause size="$4" fill={color} />
            </TouchableArea>
          )}
        </AnimatedFlex>
      ) : (
        <AnimatedFlex
          key="play"
          entering={EnterActionButton.duration(150)}
          exiting={ExitActionButton.duration(150)}
        >
          {small ? (
            <TouchableArea
              onPress={() => TrackPlayer.play()}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Play size="$3.5" fill={color} />
            </TouchableArea>
          ) : (
            <TouchableArea
              alignItems={"center"}
              justifyContent={"center"}
              onPress={() => TrackPlayer.play()}
            >
              <Play size="$4" fill={color} />
            </TouchableArea>
          )}
        </AnimatedFlex>
      )}
    </>
  );
};
