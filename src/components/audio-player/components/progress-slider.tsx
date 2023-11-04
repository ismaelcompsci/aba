import TrackPlayer, {
  Event,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { Slider, SliderTrackProps, styled, Text, XStack } from "tamagui";

import { AudioPlayerTrack } from "../../../types/types";
import { formatSeconds } from "../../../utils/utils";

import { AudiobookInfo } from "./small-audio-player";

export const ProgressSlider = ({
  color,
  trackProps,
  showThumb,
  audioTracks,
  activeTrack,
  audiobookInfo,
}: {
  color: string;
  trackProps?: SliderTrackProps;
  showThumb: boolean;
  audioTracks: AudioPlayerTrack[];
  activeTrack: AudioPlayerTrack | null;
  audiobookInfo: AudiobookInfo;
}) => {
  const { position } = useProgress();

  const currentTrackOffset = activeTrack ? activeTrack.startOffset : 0;
  const overallCurrentTime = currentTrackOffset + position;

  useTrackPlayerEvents([Event.PlaybackProgressUpdated], async (event) => {
    if (event.type === Event.PlaybackProgressUpdated) {
      TrackPlayer.updateNowPlayingMetadata({
        artwork: audiobookInfo.cover || "",
        title: audiobookInfo.title,
        artist: audiobookInfo.author,
        duration: totalDuration,
        elapsedTime: overallCurrentTime,
      });
    }
  });

  const getTotalDuration = () => {
    let total = 0;
    audioTracks.forEach((t) => (total += t.duration));
    return total;
  };

  const totalDuration = getTotalDuration();

  return (
    <>
      <ProgressContainer>
        {!!overallCurrentTime && !!totalDuration ? (
          <Slider
            flex={1}
            min={0}
            defaultValue={[overallCurrentTime ? overallCurrentTime : 0]}
            value={[overallCurrentTime ? overallCurrentTime : 0]}
            max={totalDuration ? Math.floor(totalDuration) : 100}
            step={1}
            size={"$2"}
            disabled={!showThumb}
          >
            <Slider.Track {...trackProps}>
              <Slider.TrackActive bg={color} />
            </Slider.Track>
            {showThumb ? (
              <Slider.Thumb size="$1" index={0} circular elevate />
            ) : null}
          </Slider>
        ) : (
          <PlaceHolderSlider />
        )}
      </ProgressContainer>
      {showThumb ? (
        <XStack ai={"center"} jc={"space-between"}>
          <Text fontSize={"$1"} color={"$gray10"}>
            {formatSeconds(overallCurrentTime)}
          </Text>
          <Text fontSize={"$1"} color={"$gray10"}>
            -{formatSeconds(totalDuration - overallCurrentTime)}
          </Text>
        </XStack>
      ) : null}
    </>
  );
};

const ProgressContainer = styled(XStack, {
  // flex: 1,
  gap: "$1",
  alignItems: "center",
  justifyContent: "space-between",
  mt: 4,
});

const PlaceHolderSlider = () => {
  return (
    <Slider flex={1} defaultValue={[0]} max={100} step={1}>
      <Slider.Track>
        <Slider.TrackActive />
      </Slider.Track>
      <Slider.Thumb size="$1" index={0} circular elevate />
    </Slider>
  );
};
