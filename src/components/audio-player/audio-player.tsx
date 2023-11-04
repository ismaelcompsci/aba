import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";
import TrackPlayer, {
  Capability,
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { ChevronDown } from "@tamagui/lucide-icons";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";

import useIconTheme from "../../hooks/use-icon-theme";
import { userAtom } from "../../state/app-state";
import { currentServerConfigAtom, deviceIdAtom } from "../../state/local-state";
import { PlaybackSessionExpanded } from "../../types/aba";
import { AudioPlayerTrack } from "../../types/types";
import { getItemCoverSrc } from "../../utils/api";
import { generateUUID } from "../../utils/utils";
import Sheet from "../custom-components/sheet";

import BigAudioPlayer from "./components/big-audio-player";
import { ProgressSlider } from "./components/progress-slider";
import {
  AudiobookInfo,
  AudioPlayerInfo,
  SmallAudioPlayerWrapper,
} from "./components/small-audio-player";

type PlayingState = {
  playing: boolean;
  libraryItemId?: string;
  startTime?: number;
};

export const showPlayerAtom = atom<PlayingState>({ playing: false });

const AudioPlayerContainer = () => {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);

  const [audiobookInfo, setAudiobookInfo] = useState<AudiobookInfo>({});

  const [open, setOpen] = useState(false);

  const { color, bgPress } = useIconTheme();

  const setupPlayer = async (
    playbackSession: PlaybackSessionExpanded,
    metadata: { cover: string; title: string; author: string }
  ) => {
    try {
      console.log(`[AUDIOPLAYER] SETTING UP PLAYER`);

      const tracks: AudioPlayerTrack[] = [];
      let trackIndex = 0;
      playbackSession.audioTracks.forEach((track) =>
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
            Math.floor(t.startOffset) <= playbackSession.startTime &&
            Math.floor(t.startOffset + t.duration) > playbackSession.startTime
        )
      );

      const currentTrack = tracks[currentTrackIndex];

      console.log(`[AUDIOPLAYER] LOADING TRACK ${currentTrack.title}`);

      await TrackPlayer.reset();
      await TrackPlayer.add(tracks);

      const initialPosition =
        playbackSession.currentTime - currentTrack.startOffset;

      if (playbackSession.currentTime && currentTrack) {
        await TrackPlayer.skip(currentTrack.id);
        await TrackPlayer.seekTo(initialPosition);
      }

      TrackPlayer.updateNowPlayingMetadata({
        artwork: metadata.cover,
        title: metadata.title,
        artist: metadata.author,
      });

      await TrackPlayer.play();
    } catch (error) {
      console.log("[AUDIOPLAYER] ", error);
    }
  };

  useTrackPlayerEvents(
    [Event.PlaybackActiveTrackChanged, Event.PlaybackProgressUpdated],
    async (event) => {
      if (event.type === Event.PlaybackProgressUpdated) {
        TrackPlayer.updateNowPlayingMetadata({
          artwork: audiobookInfo.cover || "",
          title: audiobookInfo.title,
          artist: audiobookInfo.author,
          // duration: totalDuration,
          // elapsedTime: overallCurrentTime,
        });
      }

      // if (
      //   event.type === Event.PlaybackActiveTrackChanged &&
      //   event.track != null &&
      //   event.index != null
      // ) {
      //   const track = await TrackPlayer.getTrack(event.index);
      //   setActiveTrack(track as AudioPlayerTrack);
      // }
    }
  );

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

      setAudiobookInfo(metadata);

      await setupPlayer(data, metadata);
    } catch (error) {
      console.log("[AUDIOPLAYER] ERROR ", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stopPlayer = async () => {
    setShowPlayer({ playing: false });
    await TrackPlayer.pause();
    await TrackPlayer.reset();
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

      startSession();
    }
  }, [showPlayer]);

  useEffect(() => {
    TrackPlayer.setupPlayer();

    TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        // Capability.SeekTo,
        // Capability.JumpForward,
        // Capability.JumpBackward,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
      progressUpdateEventInterval: 1,
      backwardJumpInterval: 30,
      forwardJumpInterval: 30,
      notificationCapabilities: [Capability.Play, Capability.Pause],
    });

    return () => {
      console.log("[AUDIOPLAYER] UNMOUNTED");
    };
  }, []);

  if (!showPlayer.playing) return null;

  console.log("[AUDIOPLAYER] AUDIOPLAYER RERENDER OG");

  const renderHeader = () => {
    return (
      <SmallAudioPlayerWrapper
        onPress={() => setOpen(true)}
        bg={"$backgroundHover"}
        mx={"$4"}
        justifyContent="center"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
        }}
      >
        <AudioPlayerInfo audiobookInfo={audiobookInfo} color="white" />
        <ProgressSlider
          showThumb={false}
          color={color}
          audiobookInfo={audiobookInfo}
        />
      </SmallAudioPlayerWrapper>
    );
  };

  return (
    <Sheet
      icon={<ChevronDown />}
      sheetStyles={{ backgroundColor: "transparent" }}
      renderHeader={renderHeader}
      open={open}
      onOpenChange={setOpen}
    >
      <BigAudioPlayer audiobookInfo={audiobookInfo} />
    </Sheet>
  );
};

export default AudioPlayerContainer;
