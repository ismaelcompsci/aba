import { styled, XStack } from "tamagui";

import { PlayPauseControl } from "./play-pause-control";

export const SEEK_INTERVAL = 30;

export const AudioPlayerControls = ({ color }: { color: string }) => {
  return (
    <AudioPlayerControlsContainer>
      {/* <View
        onPress={() => TrackPlayer.seekBy(-SEEK_INTERVAL)}
        onTouchEnd={(ev) => ev.stopPropagation()}
      >
        <Rewind size="$2" fill={color} />
      </View> */}

      <PlayPauseControl color={color} small />

      {/* <View
        onPress={() => TrackPlayer.seekBy(SEEK_INTERVAL)}
        onTouchEnd={(ev) => ev.stopPropagation()}
      >
        <FastForward size="$2" fill={color} />
      </View> */}
    </AudioPlayerControlsContainer>
  );
};

const AudioPlayerControlsContainer = styled(XStack, {
  alignItems: "center",
  gap: 16,
  justifyContent: "center",
});
