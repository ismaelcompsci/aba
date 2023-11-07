import { useState } from "react";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { Slider, SliderTrackProps, styled, Text, XStack } from "tamagui";

import { formatSeconds } from "../../../utils/utils";
import { useAudioPlayerProgress } from "../hooks/use-audio-player-progress";

import { AudiobookInfo } from "./small-audio-player";

export const ProgressSlider = ({
  color,
  trackProps,
  showThumb = false,
  audiobookInfo,
}: {
  color: string;
  trackProps?: SliderTrackProps;
  showThumb: boolean;
  audiobookInfo: AudiobookInfo;
}) => {
  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const {
    currentPosition: overallCurrentTime,
    getTotalDuration,
    seekTo,
  } = useAudioPlayerProgress();

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

  const totalDuration = getTotalDuration();

  const handleSliderEnd = async (value: number) => {
    seekTo(value, 1250, () => setIsSeeking(false));
  };

  return (
    <>
      <ProgressContainer>
        {!!overallCurrentTime && !!totalDuration ? (
          <Slider
            flex={1}
            size={"$4"}
            min={0}
            value={[isSeeking ? seek : overallCurrentTime]}
            max={totalDuration ? Math.floor(totalDuration) : 100}
            step={1}
            onValueChange={(value) => {
              setIsSeeking(true);
              setSeek(value[0]);
            }}
            onSlideEnd={() => handleSliderEnd(seek)}
          >
            <Slider.Track {...trackProps}>
              <Slider.TrackActive bg={color} />
            </Slider.Track>
            {showThumb ? (
              <Slider.Thumb size="$2" index={0} circular elevate />
            ) : null}
          </Slider>
        ) : (
          <PlaceHolderSlider />
        )}
      </ProgressContainer>
      {showThumb ? (
        <XStack ai={"center"} jc={"space-between"} pt={"$2.5"}>
          <Text fontSize={"$1"} color={"$gray10"}>
            {formatSeconds(isSeeking ? seek : overallCurrentTime)}
          </Text>
          <Text fontSize={"$1"} color={"$gray10"}>
            -
            {formatSeconds(
              totalDuration - (isSeeking ? seek : overallCurrentTime)
            )}
          </Text>
        </XStack>
      ) : null}
    </>
  );
};

const ProgressContainer = styled(XStack, {
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
