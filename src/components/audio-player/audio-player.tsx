import { useEffect, useState } from "react";
import TrackPlayer, {
  Capability,
  useIsPlaying,
} from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";
import { Button, Spinner, styled, Text, XStack, YStack } from "tamagui";

import { userAtom } from "../../state/app-state";
import { currentServerConfigAtom, deviceIdAtom } from "../../state/local-state";
import { AudioTrack, PlaybackSessionExpanded } from "../../types/aba";
import { generateUUID } from "../../utils/utils";

type PlayingState = {
  playing: boolean;
  libraryItemId?: string;
  // serverLibraryItemId?: string;
  startTime?: number;
};

export const showPlayerAtom = atom<PlayingState>({ playing: false });

const AudioPlayer = () => {
  return null;
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [startTime, setStartTime] = useState(0);

  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);

  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);

  const { playing, bufferingDuringPlay } = useIsPlaying();

  const currentTrackIndex = Math.max(
    0,
    audioTracks.findIndex(
      (t) =>
        Math.floor(t.startOffset) <= startTime &&
        Math.floor(t.startOffset + t.duration) > startTime
    )
  );

  const currentTrack = audioTracks[currentTrackIndex];

  const setupPlayer = async (playbackSession: PlaybackSessionExpanded) => {
    try {
      console.log(`[AUDIO-PLAYER] SETTING UP PLAYER`);

      setAudioTracks(playbackSession.audioTracks || []);
      setStartTime(playbackSession.startTime);

      const currentTrackIndex = Math.max(
        0,
        playbackSession.audioTracks.findIndex(
          (t) =>
            Math.floor(t.startOffset) <= playbackSession.startTime &&
            Math.floor(t.startOffset + t.duration) > playbackSession.startTime
        )
      );

      playbackSession.currentTime;

      const currentTrack = playbackSession.audioTracks[currentTrackIndex];
      const playerSrc = `${serverConfig.serverAddress}${currentTrack?.contentUrl}?token=${user?.token}`;

      console.log(`[AUDIO-PLAYER] LOADING TRACK SRC ${playerSrc}`);

      await TrackPlayer.setupPlayer();

      const test = [{ url: playerSrc }];

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
      });
      await TrackPlayer.add(test);
      // await gettrackdata();
      await TrackPlayer.seekTo(playbackSession.currentTime || 0);
      await TrackPlayer.play();
    } catch (error) {
      console.log("[AUDIO_PLAYER] ", error);
    }
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

    await setupPlayer(data);
  };

  useEffect(() => {
    if (showPlayer.playing && !playing) {
      startSession();
    }
  }, [showPlayer]);

  if (!showPlayer.playing) return null;

  return (
    <AudioPlayerContainer>
      <AudioPlayerWrapper w="80%">
        {bufferingDuringPlay ? (
          <Spinner />
        ) : (
          <Button
            borderRadius={"$12"}
            p={"$2"}
            onPress={playing ? TrackPlayer.pause : TrackPlayer.play}
          >
            {playing ? <Pause fill={"white"} /> : <Play fill={"white"} />}
          </Button>
        )}
        <Text>{currentTrack?.title}</Text>
      </AudioPlayerWrapper>
    </AudioPlayerContainer>
  );
};

const AudioPlayerContainer = styled(YStack, {
  jc: "center",
  alignItems: "center",
  position: "absolute",
  bottom: 40,
  left: 0,
  width: "100%",
  height: 60,
  zIndex: 10000,
});

const AudioPlayerWrapper = styled(XStack, {
  bg: "$backgroundFocus",
  height: "100%",
  borderRadius: "$10",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "$2",
  paddingHorizontal: "$5",
});

export default AudioPlayer;
