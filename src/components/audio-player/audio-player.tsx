import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";
import TrackPlayer, { Capability } from "react-native-track-player";
import axios from "axios";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Spinner } from "tamagui";

import useIconTheme from "../../hooks/use-icon-theme";
import {
  playbackSessionAtom,
  showPlayerAtom,
  userAtom,
} from "../../state/app-state";
import { currentServerConfigAtom, deviceIdAtom } from "../../state/local-state";
import { PlaybackSessionExpanded } from "../../types/aba";
import { AudioPlayerTrack, AudioPlayerTrackExtra } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";
import { generateUUID } from "../../utils/utils";
import Sheet from "../custom-components/sheet";
import { Screen } from "../layout/screen";

import BigAudioPlayer from "./components/big-audio-player";
import { ProgressSlider } from "./components/progress-slider";
import {
  AudiobookInfo,
  AudioPlayerInfo,
  SmallAudioPlayerWrapper,
} from "./components/small-audio-player";

const AudioPlayerContainer = () => {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const [ready, setReady] = useState(false);

  const [audiobookInfo, setAudiobookInfo] = useState<AudiobookInfo>({});
  const setPlaybackSession = useSetAtom(playbackSessionAtom);

  const [open, setOpen] = useState(true);

  const { color, bgPress } = useIconTheme();

  const setupPlayer = async (
    session: PlaybackSessionExpanded,
    metadata: { cover: string; title: string; author: string }
  ) => {
    try {
      console.log(`[AUDIOPLAYER] SETTING UP PLAYER`);

      const tracks: AudioPlayerTrack[] = [];
      let trackIndex = 0;
      session.audioTracks.forEach((track) =>
        tracks.push({
          id: trackIndex++,
          url: `${serverConfig.serverAddress}${track.contentUrl}?token=${user?.token}`,
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

      const currentTrack = tracks[currentTrackIndex];

      console.log(`[AUDIOPLAYER] LOADING TRACK ${currentTrack.title}`);

      await TrackPlayer.reset();
      await TrackPlayer.add(tracks);

      if (session.currentTime && currentTrack) {
        loadCurrentTrack({
          startTime: session.startTime,
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
    await TrackPlayer.skip(trackIndex);
    await TrackPlayer.seekTo(trackPosition);
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
    const apiRoute = `${serverConfig.serverAddress}/api/items/${showPlayer.libraryItemId}/play`;
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
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      console.log(`[AUDIOPLAYER] RECIVED SESSION FOR ${data.displayTitle}`);
      const cover = getItemCoverSrc(
        data.libraryItem,
        serverConfig,
        user?.token
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stopPlayer = async () => {
    try {
      showPlayer.playing && setShowPlayer({ playing: false });
      await TrackPlayer.pause();
      await TrackPlayer.reset();
    } catch (error) {
      console.log("[AUDIOPLAYER] stopPlayer error ", error);
    }
  };

  useEffect(() => {
    if (!audiobookInfo.cover) return;

    getColors(audiobookInfo.cover, {
      fallback: bgPress,
      cache: true,
      key: audiobookInfo.cover || "cover",
    });
  }, [audiobookInfo]);

  useEffect(() => {
    if (showPlayer.playing) {
      setAudiobookInfo({});
      setReady(false);
      startSession();
    }

    if (showPlayer.playing === false && ready) {
      stopPlayer();
    }
  }, [showPlayer]);

  useEffect(() => {
    (async () => {
      try {
        await TrackPlayer.setupPlayer();

        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
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
      console.log("[AUDIOPLAYER] UNMOUNTED");
    };
  }, []);

  if (!showPlayer.playing) return null;

  const renderHeader = () => {
    return (
      <>
        {ready ? (
          <SmallAudioPlayerWrapper onPress={() => setOpen(true)}>
            <AudioPlayerInfo audiobookInfo={audiobookInfo} color="white" />
            <ProgressSlider
              showThumb={false}
              color={color}
              audiobookInfo={audiobookInfo}
            />
          </SmallAudioPlayerWrapper>
        ) : (
          <SmallAudioPlayerWrapper ai="center">
            <Spinner />
          </SmallAudioPlayerWrapper>
        )}
      </>
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
        <BigAudioPlayer audiobookInfo={audiobookInfo} setOpen={setOpen} />
      ) : (
        <Screen bg={"$backgroundPress"} borderRadius={"$7"} paddingBottom={0}>
          <Spinner />
        </Screen>
      )}
    </Sheet>
  );
};

export default AudioPlayerContainer;
