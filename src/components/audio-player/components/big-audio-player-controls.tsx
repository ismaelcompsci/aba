import TrackPlayer from "react-native-track-player";
import {
  FastForward,
  Rewind,
  SkipBack,
  SkipForward,
} from "@tamagui/lucide-icons";
import { useTheme } from "tamagui";

import { Flex } from "../../layout/flex";
import { TouchableArea } from "../../touchable/touchable-area";
import { useAudioPlayerProgress } from "../hooks/use-audio-player-progress";

import { SEEK_INTERVAL } from "./audio-player-controls";
import { PlayPauseControl } from "./play-pause-control";

function BigAudioPlayerControls() {
  const colors = useTheme();
  const color = colors.color.get();

  return (
    <Flex row ai={"center"} width={"100%"} $gtSm={{ justifyContent: "center" }}>
      <TouchableArea
        padding={"$0"}
        alignItems={"center"}
        justifyContent={"center"}
        onPress={() => TrackPlayer.skipToPrevious()}
      >
        <SkipBack fill={color} />
      </TouchableArea>
      <Flex row centered flex={1} $gtSm={{ flex: 0 }} gap={"$3"}>
        <BackwardButton />
        <PlayPauseControl small={false} color={color} />
        <ForwardButton />
      </Flex>
      <TouchableArea
        alignItems={"center"}
        justifyContent={"center"}
        onPress={() => TrackPlayer.skipToNext()}
      >
        <SkipForward fill={color} />
      </TouchableArea>
    </Flex>
  );
}

const ForwardButton = () => {
  const { jumpForwards } = useAudioPlayerProgress();
  const colors = useTheme();

  return (
    <TouchableArea
      borderRadius={"$12"}
      padding={"$0"}
      alignItems={"center"}
      justifyContent={"center"}
      h={"$6"}
      w={"$6"}
      onPress={() => jumpForwards(SEEK_INTERVAL)}
    >
      <FastForward size="$3" fill={colors.color.get()} />
    </TouchableArea>
  );
};

const BackwardButton = () => {
  const { jumpBackwards } = useAudioPlayerProgress();
  const colors = useTheme();
  return (
    <TouchableArea
      borderRadius={"$12"}
      padding={"$0"}
      alignItems={"center"}
      justifyContent={"center"}
      h={"$6"}
      w={"$6"}
      onPress={() => jumpBackwards(SEEK_INTERVAL)}
    >
      <Rewind size="$3" fill={colors.color.get()} />
    </TouchableArea>
  );
};

export default BigAudioPlayerControls;
