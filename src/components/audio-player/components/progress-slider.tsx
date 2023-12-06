import { useState } from "react";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { Slider, SliderTrackProps, Text } from "tamagui";

import { playbackSessionAtom, userAtom } from "../../../state/app-state";
import { currentServerConfigAtom } from "../../../state/local-state";
import { formatSeconds } from "../../../utils/utils";
import { Flex } from "../../layout/flex";
import { useAudioPlayerProgress } from "../hooks/use-audio-player-progress";

import { AudiobookInfo } from "./small-audio-player";

const TIME_BETWEEN_SESSION_UPDATES = 10;

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
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const [playbackSession, setPlaybackSession] = useAtom(playbackSessionAtom);

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
      updateSession();
    }
  });

  const totalDuration = getTotalDuration();

  const handleSliderEnd = async (value: number) => {
    seekTo(value, 1250, () => setIsSeeking(false));
  };

  const updateSession = async () => {
    if (showThumb) return;
    // udpate only every 15 seconds
    const nowInMilliseconds = Date.now();
    const nowInSeconds = nowInMilliseconds / 1000;
    const lastUpdateInMilliseconds =
      playbackSession?.updatedAt || nowInMilliseconds;
    const lastUpdateInSeconds = lastUpdateInMilliseconds / 1000;
    const secondsSinceLastUpdate = nowInSeconds - lastUpdateInSeconds;

    let sync = false;
    let timeListening = playbackSession?.timeListening || 0;
    const newTimeListening = (timeListening += secondsSinceLastUpdate);
    if (newTimeListening >= TIME_BETWEEN_SESSION_UPDATES) sync = true;

    sync &&
      // @ts-ignore
      setPlaybackSession((prev) => {
        return {
          ...prev,
          currentTime: overallCurrentTime,
          updatedAt: nowInMilliseconds,
          timeListening: newTimeListening,
        };
      });

    if (sync) {
      console.log("SYNCING SESSION");
      const updatePayload = {
        currentTime: overallCurrentTime,
        timeListened: TIME_BETWEEN_SESSION_UPDATES,
        duration: totalDuration,
      };

      try {
        const response = await axios.post(
          `${serverConfig.serverAddress}/api/session/${playbackSession?.id}/sync`,
          updatePayload,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        if (response.data) {
          // @ts-ignore
          setPlaybackSession((prev) => {
            return { ...prev, timeListening: 0 };
          });
        }
      } catch (error) {
        console.log("[PROGRESS_SLIDER] updateProgress error", error);
      }
    }
  };

  return (
    <Flex>
      <Flex gap="$1" alignItems="center" justifyContent="space-between" mt={4}>
        {!!overallCurrentTime && !!totalDuration ? (
          <Slider
            width={"100%"}
            size={"$4"}
            min={0}
            value={[isSeeking ? seek : overallCurrentTime]}
            max={totalDuration ? Math.floor(totalDuration) : 100}
            step={1}
            onValueChange={(value) => {
              setIsSeeking(true);
              setSeek(value[0]);
            }}
            disabled={!showThumb}
            onSlideEnd={() => {
              showThumb && handleSliderEnd(seek);
            }}
          >
            <Slider.Track {...trackProps}>
              <Slider.TrackActive bg={color} />
            </Slider.Track>
            {showThumb ? (
              <Slider.Thumb
                size={"$1"}
                scale={isSeeking ? 1.5 : 1}
                index={0}
                circular
                elevate
              />
            ) : null}
          </Slider>
        ) : (
          <PlaceHolderSlider showThumb={showThumb} />
        )}
      </Flex>
      {showThumb ? (
        <Flex row ai={"center"} jc={"space-between"} pt={"$2.5"}>
          <Text fontSize={"$1"} color={"$gray10"}>
            {formatSeconds(isSeeking ? seek : overallCurrentTime)}
          </Text>
          <Text fontSize={"$1"} color={"$gray10"}>
            {formatSeconds(
              totalDuration - (isSeeking ? seek : overallCurrentTime)
            )}
          </Text>
        </Flex>
      ) : null}
    </Flex>
  );
};

const PlaceHolderSlider = ({ showThumb }: { showThumb: boolean }) => {
  return (
    <Slider width={"100%"} size={"$4"} defaultValue={[0]} max={100} step={1}>
      <Slider.Track>
        <Slider.TrackActive />
      </Slider.Track>
      {showThumb ? <Slider.Thumb size="$1" index={0} circular elevate /> : null}
    </Slider>
  );
};
