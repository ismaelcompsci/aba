import { useEffect, useState } from "react";
import { createNativeWrapper } from "react-native-gesture-handler";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import Slider from "@react-native-community/slider";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";
import { Text } from "tamagui";

import { IS_ANDROID, IS_IOS } from "../../../constants/consts";
import {
  playbackSessionAtom,
  serverAddressAtom,
  showPlayerAtom,
  userTokenAtom,
} from "../../../state/app-state";
import { secondsToTimestamp } from "../../../utils/utils";
import { Flex } from "../../layout/flex";
import { useAudioPlayerProgress } from "../hooks/use-audio-player-progress";

import { AudiobookInfo } from "./small-audio-player";

const TIME_BETWEEN_SESSION_UPDATES = 10;

export const sliderLoadingAtom = atom(true);

const WrappedSlider = createNativeWrapper(Slider, {
  shouldCancelWhenOutside: false,
  shouldActivateOnStart: true,
  disallowInterruption: true,
});

export const ProgressSlider = ({
  audiobookInfo,
}: {
  audiobookInfo: AudiobookInfo;
}) => {
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const serverAddress = useAtomValue(serverAddressAtom);
  const userToken = useAtomValue(userTokenAtom);
  const [seek, setSeek] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const [playbackSession, setPlaybackSession] = useAtom(playbackSessionAtom);

  const {
    isFinished,
    currentPosition: overallCurrentTime,
    duration,
    seekTo,
  } = useAudioPlayerProgress();

  useEffect(() => {
    if (isFinished && showPlayer.playlist) {
      const prevItem = showPlayer.playlist[0];

      const updatedPlaylist = showPlayer.playlist.filter((item) => {
        return prevItem.libraryItemId !== item.libraryItemId;
      });

      const isPlaylistDone = !updatedPlaylist.length;

      const nextItem = updatedPlaylist[0];
      if (!isPlaylistDone)
        setShowPlayer({
          open: true,
          playing: true,
          playlist: updatedPlaylist,
          libraryItemId: nextItem.libraryItemId,
          episodeId: nextItem.episodeId ?? undefined,
        });
    }
  }, [isFinished]);

  useEffect(() => {
    if (isFinished) {
      syncSession({
        currentTime: overallCurrentTime,
        timeListened: TIME_BETWEEN_SESSION_UPDATES,
        duration: duration,
      });
    }
  }, [isFinished]);

  useTrackPlayerEvents([Event.PlaybackProgressUpdated], async (event) => {
    if (event.type === Event.PlaybackProgressUpdated) {
      TrackPlayer.updateNowPlayingMetadata({
        artwork: audiobookInfo.cover || "",
        title: audiobookInfo.title,
        artist: audiobookInfo.author,
        duration: duration,
        elapsedTime: overallCurrentTime,
      });
      updateSession();
    }
  });

  const handleSliderEnd = async (value: number) => {
    seekTo(value, 1600, () => {
      setIsSeeking(false);
    });
  };

  const updateSession = async (force: boolean = false) => {
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

    (sync || force) &&
      // @ts-ignore
      setPlaybackSession((prev) => {
        return {
          ...prev,
          currentTime: overallCurrentTime,
          updatedAt: nowInMilliseconds,
          timeListening: newTimeListening,
        };
      });

    if (sync || force) {
      const updatePayload = {
        currentTime: overallCurrentTime,
        timeListened: TIME_BETWEEN_SESSION_UPDATES,
        duration: duration,
      };

      await syncSession(updatePayload);
    }
  };

  const syncSession = async (updatePayload: {
    currentTime: number;
    timeListened: number;
    duration: number;
  }) => {
    console.log("SYNCING SESSION");

    try {
      const response = await axios.post(
        `${serverAddress}/api/session/${playbackSession?.id}/sync`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
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
  };

  return (
    <Flex alignItems="center" justifyContent="space-between" mt={4}>
      <WrappedSlider
        style={{
          width: "100%",
        }}
        value={isSeeking ? seek : overallCurrentTime}
        minimumValue={0}
        step={1}
        onSlidingStart={() => {
          if (!isSeeking) {
            setIsSeeking(true);
          }
        }}
        onValueChange={setSeek}
        onSlidingComplete={() => handleSliderEnd(seek)}
        maximumValue={duration ? Math.floor(duration) : 99999}
        tapToSeek={IS_IOS}
      />
      <Flex
        row
        ai={"center"}
        jc={"space-between"}
        w={IS_ANDROID ? "95%" : "100%"}
      >
        <Text fontSize={"$1"} color={"$gray10"}>
          {secondsToTimestamp(isSeeking ? seek : overallCurrentTime)}
        </Text>
        <Text fontSize={"$1"} color={"$gray10"}>
          -
          {secondsToTimestamp(
            duration - (isSeeking ? seek : overallCurrentTime)
          )}
        </Text>
      </Flex>
    </Flex>
  );
};
