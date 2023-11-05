import { useEffect, useState } from "react";
import { GestureResponderEvent } from "react-native";
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
  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [audioTracks, setAudioTracks] = useState<TrackExtended[] | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const { position } = useProgress();

  const currentTrackOffset = currentTrack ? currentTrack.startOffset : 0;
  const overallCurrentTime = currentTrackOffset + position;

  useTrackPlayerEvents(
    [Event.PlaybackProgressUpdated, Event.PlaybackActiveTrackChanged],
    async (event) => {
      if (event.type === Event.PlaybackProgressUpdated) {
        TrackPlayer.updateNowPlayingMetadata({
          artwork: audiobookInfo.cover || "",
          title: audiobookInfo.title,
          artist: audiobookInfo.author,
          duration: totalDuration,
          elapsedTime: overallCurrentTime,
        });
      }
      if (event.type === Event.PlaybackActiveTrackChanged) {
        event.track && setCurrentTrack(event.track);
      }
    }
  );

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

  const handleSliderEnd = async (
    event: GestureResponderEvent,
    value: number
  ) => {
    if (!audioTracks?.length) return;

    const trackIndex = Math.max(
      0,
      audioTracks.findIndex(
        (t) =>
          Math.floor(t.startOffset) <= value &&
          Math.floor(t.startOffset + t.duration) > value
      )
    );

    const initialPosition = value - audioTracks[trackIndex].startOffset;
    await TrackPlayer.skip(trackIndex, initialPosition);
    /**
     * stops the slider from bouncing
     */
    TrackPlayer.play().then(() => {
      setTimeout(() => {
        setIsSeeking(false);
      }, 1500);
    });
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
            step={5}
            onValueChange={(value) => {
              setIsSeeking(true);
              setSeek(value[0]);
            }}
            onSlideEnd={handleSliderEnd}
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
        <XStack ai={"center"} jc={"space-between"} pt={"$1.5"}>
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
