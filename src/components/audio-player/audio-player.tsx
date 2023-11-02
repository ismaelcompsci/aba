import { useEffect, useState } from "react";
import TrackPlayer, {
  Capability,
  Event,
  useIsPlaying,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { Pause, Play, SkipBack, SkipForward } from "@tamagui/lucide-icons";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";
import {
  Button,
  Image,
  Slider,
  styled,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";

import useIconTheme from "../../hooks/use-icon-theme";
import { userAtom } from "../../state/app-state";
import { currentServerConfigAtom, deviceIdAtom } from "../../state/local-state";
import { PlaybackSessionExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { generateUUID } from "../../utils/utils";

type PlayingState = {
  playing: boolean;
  libraryItemId?: string;
  startTime?: number;
};

type AudioPlayerTrack = {
  id: number;
  url: string;
  duration: number;
  title: string;
  startOffset: number;
};

type AudiobookInfo = {
  title?: string;
  author?: string;
  cover?: string | null | undefined;
};

const formatSeconds = (time: number) =>
  new Date(time * 1000).toISOString().slice(11, 19);

export const showPlayerAtom = atom<PlayingState>({ playing: false });

const AudioPlayer = () => {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);

  const [trackTitle, setTrackTitle] = useState("");
  const [audiobookInfo, setAudiobookInfo] = useState<AudiobookInfo>({});
  const [audioTracks, setAudioTracks] = useState<AudioPlayerTrack[]>([]);
  const [acitveTrack, setActiveTrack] = useState<AudioPlayerTrack | null>(null);

  const { playing } = useIsPlaying();
  const { position } = useProgress();

  const { color } = useIconTheme();

  const setupPlayer = async (playbackSession: PlaybackSessionExpanded) => {
    try {
      console.log(`[AUDIO-PLAYER] SETTING UP PLAYER`);

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
      console.log(`[AUDIO-PLAYER] TRACKS LENGTH ${tracks.length}`);
      setAudioTracks(tracks);

      const currentTrackIndex = Math.max(
        0,
        tracks.findIndex(
          (t) =>
            Math.floor(t.startOffset) <= playbackSession.startTime &&
            Math.floor(t.startOffset + t.duration) > playbackSession.startTime
        )
      );

      const currentTrack = tracks[currentTrackIndex];

      console.log(`[AUDIO-PLAYER] LOADING TRACK ${currentTrack.title}`);

      await TrackPlayer.reset();
      await TrackPlayer.add(tracks);

      const initialPosition =
        playbackSession.currentTime - currentTrack.startOffset;

      if (playbackSession.currentTime && currentTrack) {
        console.log(currentTrack);
        await TrackPlayer.skip(currentTrack.id);
        await TrackPlayer.seekTo(initialPosition);
      }

      await TrackPlayer.play();
      console.log("[AUDIO-PLAYER] PLAYING AUDIO");
    } catch (error) {
      console.log("[AUDIO_PLAYER] ", error);
    }
  };

  useTrackPlayerEvents(
    [Event.PlaybackState, Event.PlaybackActiveTrackChanged],
    async (event) => {
      if (event.type === Event.PlaybackState) {
        // console.log(event);
      }

      if (
        event.type === Event.PlaybackActiveTrackChanged &&
        event.track != null &&
        event.index != null
      ) {
        const track = await TrackPlayer.getTrack(event.index);
        setActiveTrack(track as AudioPlayerTrack);
        const { title } = track || {};
        setTrackTitle(title || "");
      }
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

    const { data }: { data: PlaybackSessionExpanded } = await axios.post(
      apiRoute,
      payload,
      {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );

    console.log(`[AUDIO-PLAYER] RECIVED SESSION FOR ${data.displayTitle}`);
    const cover = getItemCoverSrc(data.libraryItem, serverConfig, user?.token);

    setAudiobookInfo({
      title: data.displayTitle,
      author: data.displayAuthor,
      cover: cover,
    });

    await setupPlayer(data);
  };

  const stopPlayer = async () => {
    setShowPlayer({ playing: false });
    await TrackPlayer.pause();
    await TrackPlayer.reset();
  };

  useEffect(() => {
    if (showPlayer.playing) {
      setActiveTrack(null);
      setAudioTracks([]);
      setAudiobookInfo({});
      setTrackTitle("");

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
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
      progressUpdateEventInterval: 1,
    });

    return () => {
      console.log("[AUDIO-PLAYER] UNMOUNTED");
    };
  }, []);

  const currentTrackOffset = acitveTrack ? acitveTrack.startOffset : 0;
  const overallCurrentTime = currentTrackOffset + position;

  const getTotalDuration = () => {
    let total = 0;
    audioTracks.forEach((t) => (total += t.duration));
    return total;
  };

  const totalDuration = getTotalDuration();

  if (!showPlayer.playing) return null;
  return (
    <AudioPlayerContainer
      animation={"medium"}
      enterStyle={{
        y: 100,
      }}
    >
      <AudioPlayerWrapper>
        {/* info */}
        <XStack width="100%" gap="$3" alignItems="center">
          {audiobookInfo.cover ? (
            <Image
              width={52}
              height={52}
              resizeMode="contain"
              source={{
                uri: audiobookInfo.cover,
              }}
            />
          ) : null}
          <YStack gap="$1">
            <Text fontSize={14} fontWeight={"$7"}>
              {audiobookInfo.title}
            </Text>
            <Text fontSize={14} color={"$gray10"}>
              {audiobookInfo.author}
            </Text>
          </YStack>
        </XStack>
        {/* slider */}
        <XStack width="100%" gap={"$1"} alignItems="center" mt={12}>
          <Text fontSize="$2">
            {formatSeconds(overallCurrentTime) || "00:00:00"}
          </Text>
          {overallCurrentTime && totalDuration ? (
            <Slider
              width="70%"
              min={0}
              defaultValue={[overallCurrentTime ? overallCurrentTime : 0]}
              max={totalDuration ? Math.floor(totalDuration) : 100}
              step={1}
            >
              <Slider.Track>
                <Slider.TrackActive />
              </Slider.Track>
              <Slider.Thumb size="$1" index={0} circular elevate />
            </Slider>
          ) : (
            <PlaceHolderSlider />
          )}
          <Text fontSize="$2">
            {formatSeconds(totalDuration) || "00:00:00"}
          </Text>
        </XStack>

        {/* play pause next prev */}
        <XStack
          width="100%"
          alignItems="center"
          justifyContent="center"
          gap={16}
          mt="$4"
        >
          <SkipBack size="$2" fill={color} />
          <View
            onPress={() => (playing ? TrackPlayer.pause() : TrackPlayer.play())}
          >
            {playing ? (
              <Pause size="$3.5" fill={color} />
            ) : (
              <Play size="$3.5" fill={color} />
            )}
          </View>
          <SkipForward size="$2" fill={color} />
        </XStack>
      </AudioPlayerWrapper>
    </AudioPlayerContainer>
  );
};

const PlaceHolderSlider = () => {
  return (
    <Slider width="70%" defaultValue={[0]} max={100} step={1}>
      <Slider.Track>
        <Slider.TrackActive />
      </Slider.Track>
      <Slider.Thumb size="$1" index={0} circular elevate />
    </Slider>
  );
};
const AudioPlayerContainer = styled(YStack, {
  jc: "center",
  alignItems: "center",
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  height: 152 + 32,
  zIndex: 10000,
});

const AudioPlayerWrapper = styled(YStack, {
  bg: "$backgroundFocus",
  height: "100%",
  borderRadius: "$7",
  padding: "$3",
  width: "100%",
});

const CirlceButton = styled(Button, {
  borderRadius: "$12",
  padding: "$0",
  width: "$4",
  height: "$4",
  alignItems: "center",
  justifyContent: "center",
});

export default AudioPlayer;
