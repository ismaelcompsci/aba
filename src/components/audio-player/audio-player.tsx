import { useEffect, useState } from "react";
import TrackPlayer, { Capability } from "react-native-track-player";
import axios from "axios";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectAtom } from "jotai/utils";
import { Spinner, useTheme } from "tamagui";

import {
  playbackSessionAtom,
  serverAddressAtom,
  showPlayerAtom,
  userTokenAtom,
} from "../../state/app-state";
import { deviceIdAtom } from "../../state/local-state";
import { PlaybackSessionExpanded } from "../../types/aba";
import { AudioPlayerTrack, AudioPlayerTrackExtra } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";
import { awaitTimeout, generateUUID } from "../../utils/utils";
import Sheet from "../custom-components/sheet";
import { Flex } from "../layout/flex";

import BigAudioPlayer from "./components/big-audio-player";
import {
  ProgressSlider,
  sliderLoadingAtom,
} from "./components/progress-slider";
import {
  AudiobookInfo,
  AudioPlayerInfo,
  SmallAudioPlayerWrapper,
} from "./components/small-audio-player";

const playbackSessionIdAtom = selectAtom(
  playbackSessionAtom,
  (session) => session?.id
);

const AudioPlayerContainer = () => {
  const serverAddress = useAtomValue(serverAddressAtom);
  const userToken = useAtomValue(userTokenAtom);
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const [ready, setReady] = useState(false);

  const [audiobookInfo, setAudiobookInfo] = useState<AudiobookInfo>({});
  const setPlaybackSession = useSetAtom(playbackSessionAtom);
  const playbackSessionId = useAtomValue(playbackSessionIdAtom);
  const setSliderLoadingAtom = useSetAtom(sliderLoadingAtom);

  const [open, setOpen] = useState(false);

  const colors = useTheme();

  const setupPlayer = async (
    session: PlaybackSessionExpanded,
    metadata: { cover: string; title: string; author: string }
  ) => {
    try {
      setSliderLoadingAtom(true);
      console.log(`[AUDIOPLAYER] SETTING UP PLAYER`);

      const tracks: AudioPlayerTrack[] = [];
      let trackIndex = 0;
      session.audioTracks.forEach((track) =>
        tracks.push({
          id: trackIndex++,
          url: `${serverAddress}${track.contentUrl}?token=${userToken}`,
          duration: track.duration,
          title: track.title,
          startOffset: track.startOffset,
        })
      );
      console.log(`[AUDIOPLAYER] TRACKS LENGTH ${tracks.length}`);

      const currentTrackIndex = Math.max(
        0,
        tracks.findIndex(
          (t) =>
            Math.floor(t.startOffset) <= session.startTime &&
            Math.floor(t.startOffset + (t.duration || 0)) > session.startTime
        )
      );

      const playFromChapterIndex = showPlayer.chapterId
        ? tracks.findIndex((t) => t.id === showPlayer.chapterId)
        : null;

      const currentTrack = playFromChapterIndex
        ? tracks[playFromChapterIndex]
        : tracks[currentTrackIndex];

      console.log(`[AUDIOPLAYER] LOADING TRACK ${currentTrack.title}`);

      await TrackPlayer.reset();
      await TrackPlayer.add(tracks);

      if (session.currentTime && currentTrack) {
        await loadCurrentTrack({
          startTime: showPlayer.startTime
            ? showPlayer.startTime
            : session.startTime,
          currentTrack,
        });
      }

      TrackPlayer.updateNowPlayingMetadata({
        artwork: metadata.cover,
        title: metadata.title,
        artist: metadata.author,
        duration: session.duration,
      });

      setReady(true);
      await TrackPlayer.play();
    } catch (error) {
      console.log("[AUDIOPLAYER] ", error);
    } finally {
      setSliderLoadingAtom(false);
    }
  };

  const loadCurrentTrack = async ({
    startTime,
    currentTrack,
  }: {
    startTime: number;
    currentTrack: AudioPlayerTrackExtra;
  }) => {
    const trackIndex = currentTrack.id;
    const trackPosition = Math.max(
      0,
      startTime - (currentTrack.startOffset || 0)
    );
    await TrackPlayer.skip(trackIndex, trackPosition);
    await awaitTimeout(100);
    console.log("HELLO");
    setSliderLoadingAtom(false);
  };

  const getDeviceId = () => {
    let id = deviceId;
    if (!id) {
      id = generateUUID(16);
      setDeviceId(id);
    }
    return id;
  };

  const startSession = async () => {
    const route = !showPlayer.episodeId
      ? `/api/items/${showPlayer.libraryItemId}/play`
      : `/api/items/${showPlayer.libraryItemId}/play/${showPlayer.episodeId}`;

    const apiRoute = `${serverAddress}${route}`;

    const payload = {
      deviceInfo: {
        clientName: "aba-mobile",
        deviceId: getDeviceId(),
      },
      forceDirectPlay: true,
      forceTranscode: false,
    };

    try {
      const { data }: { data: PlaybackSessionExpanded } = await axios.post(
        apiRoute,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      console.log(`[AUDIOPLAYER] RECIVED SESSION FOR ${data.displayTitle}`);
      const cover = getItemCoverSrc(
        data.libraryItem,
        null,
        userToken,
        serverAddress
      );

      const metadata = {
        title: data.displayTitle,
        author: data.displayAuthor,
        cover: cover || "",
      };

      setPlaybackSession(data);
      setAudiobookInfo(metadata);
      await setupPlayer(data, metadata);
    } catch (error) {
      console.log("[AUDIOPLAYER] ERROR ", error);
    }
  };

  const stopPlayer = async () => {
    try {
      if (playbackSessionId) {
        await axios.post(
          `${serverAddress}/api/session/${playbackSessionId}/close`,
          null,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.log("[AUDIOPLAYER] stopPlayer error ", error);
      if (axios.isAxiosError(error)) {
        console.log("[AUDIOPLAYER] could not close session ", error);
      }
    } finally {
      await TrackPlayer.pause();
      await TrackPlayer.reset();
      setShowPlayer({ open: false, playing: false });
    }
  };

  useEffect(() => {
    if (showPlayer.playing) {
      setAudiobookInfo({});
      setReady(false);
      startSession();
    }

    if (showPlayer.playing === false && ready) {
      console.log("CLOSING PLAYER");
      stopPlayer();
    }
  }, [showPlayer]);

  useEffect(() => {
    (async () => {
      try {
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            // Capability.SkipToNext,
            // Capability.SkipToPrevious,
            // Capability.SeekTo,
          ],
          compactCapabilities: [Capability.Play, Capability.Pause],
          progressUpdateEventInterval: 1,
          backwardJumpInterval: 30,
          forwardJumpInterval: 30,
          notificationCapabilities: [Capability.Play, Capability.Pause],
        });
      } catch (error) {
        console.log("[AUIDOPLAYER] TrackPlayer setup error", error);
      }
    })();

    return () => {
      TrackPlayer.pause();
      TrackPlayer.reset();
      console.log("[AUDIOPLAYER] UNMOUNTED");
    };
  }, []);

  const renderHeader = () => {
    return (
      <SmallAudioPlayerWrapper onPress={() => setOpen(true)}>
        {ready ? (
          <>
            <AudioPlayerInfo audiobookInfo={audiobookInfo} color="white" />
            <ProgressSlider
              showThumb={false}
              color={colors.color.get()}
              audiobookInfo={audiobookInfo}
            />
          </>
        ) : (
          <Spinner />
        )}
      </SmallAudioPlayerWrapper>
    );
  };

  return (
    <Sheet
      sheetStyles={{ backgroundColor: "transparent" }}
      renderHeader={renderHeader}
      open={open}
      onOpenChange={setOpen}
      controlled
    >
      {ready ? (
        <BigAudioPlayer
          audiobookInfo={audiobookInfo}
          setOpen={setOpen}
          libraryItemId={showPlayer.libraryItemId ?? ""}
        />
      ) : (
        <Flex
          fill
          centered
          borderRadius={"$7"}
          paddingBottom={0}
          bg={"$background"}
        >
          <Spinner />
        </Flex>
      )}
    </Sheet>
  );
};

export default AudioPlayerContainer;
