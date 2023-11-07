import TrackPlayer from "react-native-track-player";
import {
  FastForward,
  Rewind,
  SkipBack,
  SkipForward,
} from "@tamagui/lucide-icons";
import { XStack } from "tamagui";

import useIconTheme from "../../../hooks/use-icon-theme";
import { useAudioPlayerProgress } from "../hooks/use-audio-player-progress";

import { SEEK_INTERVAL } from "./audio-player-controls";
import { CirlceButton } from "./circle-button";
import { PlayPauseControl } from "./play-pause-control";

function BigAudioPlayerControls() {
  const { color } = useIconTheme();

  const { jumpForwards, jumpBackwards } = useAudioPlayerProgress();

  return (
    <XStack
      ai={"center"}
      width={"100%"}
      pt={"$4"}
      $gtSm={{ justifyContent: "center" }}
    >
      <CirlceButton onPress={() => TrackPlayer.skipToPrevious()}>
        <SkipBack fill={color} />
      </CirlceButton>
      <XStack
        ai={"center"}
        justifyContent="center"
        flex={1}
        $gtSm={{ flex: 0 }}
        gap={"$3"}
      >
        <CirlceButton
          h={"$6"}
          w={"$6"}
          onPress={() => jumpBackwards(SEEK_INTERVAL)}
        >
          <Rewind size="$3" fill={color} />
        </CirlceButton>
        <PlayPauseControl small={false} color={color} />
        <CirlceButton
          h={"$6"}
          w={"$6"}
          onPress={() => jumpForwards(SEEK_INTERVAL)}
        >
          <FastForward size="$3" fill={color} />
        </CirlceButton>
      </XStack>
      <CirlceButton onPress={() => TrackPlayer.skipToNext()}>
        <SkipForward fill={color} />
      </CirlceButton>
    </XStack>
  );
}

export default BigAudioPlayerControls;
