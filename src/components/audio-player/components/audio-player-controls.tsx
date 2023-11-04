import TrackPlayer from "react-native-track-player";
import { FastForward, Rewind } from "@tamagui/lucide-icons";
import { styled, View, XStack } from "tamagui";

import { PlayPauseControl } from "./play-pause-control";

export const SEEK_INTERVAL = 30;

export const AudioPlayerControls = ({ color }: { color: string }) => {
  console.log("[AUDIOPLAYER] AudioPlayerControls RERENDER");
  return (
    <AudioPlayerControlsContainer>
      <View onPress={() => TrackPlayer.seekBy(-SEEK_INTERVAL)}>
        <Rewind size="$2" fill={color} />
      </View>

      <PlayPauseControl color={color} small />

      <View onPress={() => TrackPlayer.seekBy(SEEK_INTERVAL)}>
        <FastForward size="$2" fill={color} />
      </View>
    </AudioPlayerControlsContainer>
  );
};

const AudioPlayerControlsContainer = styled(XStack, {
  alignItems: "center",
  gap: 16,
  justifyContent: "center",
});
