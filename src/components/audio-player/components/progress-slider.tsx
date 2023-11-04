import { useEffect, useState } from "react";
import TrackPlayer, {
  Event,
  Track,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { Slider, SliderTrackProps, styled, Text, XStack } from "tamagui";

import { formatSeconds } from "../../../utils/utils";

import { AudiobookInfo } from "./small-audio-player";

type TrackExtended = Track & {
  url: string;
};

export const ProgressSlider = ({
  color,
  trackProps,
  showThumb,
  audiobookInfo,
}: {
  color: string;
  trackProps?: SliderTrackProps;
  showThumb: boolean;
  audiobookInfo: AudiobookInfo;
}) => {
  const [audioTracks, setAudioTracks] = useState<TrackExtended[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const { position } = useProgress();

  const currentTrackOffset = currentTrack ? currentTrack.startOffset : 0;
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
    audioTracks?.forEach((t) => (total += t.duration || 0));
    return total;
  };

  const totalDuration = getTotalDuration();

  useEffect(() => {
    (async () => {
      const track = await TrackPlayer.getActiveTrack();
      const tracks = await TrackPlayer.getQueue();
      setAudioTracks(tracks);
      setCurrentTrack(track ? track : null);
    })();
  }, []);

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
