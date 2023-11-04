import { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import FastImage from "react-native-fast-image";
import Animated, { Keyframe } from "react-native-reanimated";
import TrackPlayer, {
  Capability,
  Event,
  useIsPlaying,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import {
  ChevronDown,
  FastForward,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
} from "@tamagui/lucide-icons";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";
import {
  Button,
  H3,
  H6,
  Image,
  Slider,
  SliderTrackProps,
  Stack,
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
import Sheet from "../custom-components/sheet";

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

const ExitActionButton = new Keyframe({
  0: {
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  50: {
    transform: [{ scale: 0.5 }],
    opacity: 0.5,
  },
  100: {
    transform: [{ scale: 0 }],
    opacity: 0,
  },
});

const EnterActionButton = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
    opacity: 0,
  },
  50: {
    transform: [{ scale: 0.5 }],
    opacity: 0.5,
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
  },
});

const { width, height } = Dimensions.get("window");
const SMALL_PLAYER_HEIGHT = 80;
const SKIP_INTERVAL = 30;

const AudioPlayer = () => {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const [deviceId, setDeviceId] = useAtom(deviceIdAtom);
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);

  const [audiobookInfo, setAudiobookInfo] = useState<AudiobookInfo>({});
  const [audioTracks, setAudioTracks] = useState<AudioPlayerTrack[]>([]);
  const [acitveTrack, setActiveTrack] = useState<AudioPlayerTrack | null>(null);

  const { playing } = useIsPlaying();
  const { position } = useProgress();

  const { color, bg, bgPress } = useIconTheme();

  const setupPlayer = async (playbackSession: PlaybackSessionExpanded) => {
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

      console.log(`[AUDIOPLAYER] LOADING TRACK ${currentTrack.title}`);

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
    } catch (error) {
      console.log("[AUDIOPLAYER] ", error);
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

      setAudiobookInfo({
        title: data.displayTitle,
        author: data.displayAuthor,
        cover: cover,
      });

      await setupPlayer(data);
    } catch (error) {
      console.log("[AUDIOPLAYER] ERROR ", error);
    }
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
      console.log("[AUDIOPLAYER] UNMOUNTED");
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

  const renderHeader = () => {
    return (
      <SmallAudioPlayerWrapper
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
        <AudioPlayerInfo
          audiobookInfo={audiobookInfo}
          playing={playing === undefined ? false : playing}
          color="white"
        />
        <ProgressSlider
          showThumb={false}
          color={color}
          totalDuration={totalDuration}
          overallCurrentTime={overallCurrentTime}
        />
      </SmallAudioPlayerWrapper>
    );
  };

  const imageWidth = width * 0.7;
  const imageHeight = imageWidth;

  return (
    <Sheet
      icon={<ChevronDown />}
      navigationStyle={{ backgroundColor: bgPress }}
      sheetStyles={{ backgroundColor: "transparent" }}
      renderHeader={renderHeader}
    >
      <YStack bg={"$backgroundPress"} width={"100%"} height={"100%"} px={"$4"}>
        {/* IMAGE */}
        <XStack width={"100%"} height={"50%"} jc={"center"} ai={"center"}>
          <Stack $gtSm={{ pt: "$0" }} $gtMd={{ pt: "$9" }}>
            <FastImage
              style={{
                width: imageWidth,
                height: imageHeight,
                borderRadius: 16,
              }}
              resizeMode="cover"
              source={{
                uri: audiobookInfo.cover || "",
              }}
            />
          </Stack>
        </XStack>
        {/* INFO */}
        <YStack paddingTop={"$8"}>
          <H3>{audiobookInfo.title}</H3>
          <H6>{audiobookInfo.author}</H6>
        </YStack>
        {/* PROGRESS */}
        <YStack space={"$2"} pt={"$4"} width={"100%"}>
          <ProgressSlider
            showThumb
            color={color}
            overallCurrentTime={overallCurrentTime}
            totalDuration={totalDuration}
          />

          <XStack ai={"center"} jc={"space-between"}>
            <Text fontSize={"$1"} color={"$gray10"}>
              {formatSeconds(overallCurrentTime)}
            </Text>
            <Text fontSize={"$1"} color={"$gray10"}>
              {formatSeconds(totalDuration)}
            </Text>
          </XStack>
        </YStack>
        {/* CONTROLS */}
        <XStack ai={"center"} width={"100%"} pt={"$4"}>
          <CirlceButton>
            <SkipBack />
          </CirlceButton>
          <XStack ai={"center"} justifyContent="center" flex={1} gap={"$3"}>
            <CirlceButton
              h={"$6"}
              w={"$6"}
              onPress={() => TrackPlayer.seekBy(-SKIP_INTERVAL)}
            >
              <Rewind size="$3" fill={color} />
            </CirlceButton>
            <PlayPauseControl
              small={false}
              playing={playing === undefined ? false : playing}
              color={color}
            />
            <CirlceButton
              h={"$6"}
              w={"$6"}
              onPress={() => TrackPlayer.seekBy(SKIP_INTERVAL)}
            >
              <FastForward size="$3" fill={color} />
            </CirlceButton>
          </XStack>
          <CirlceButton>
            <SkipForward />
          </CirlceButton>
        </XStack>
        {/* ACTIONS */}
      </YStack>
    </Sheet>
  );
};

export const SmallAudioPlayerWrapper = styled(YStack, {
  // bg: "$backgroundFocus",
  height: SMALL_PLAYER_HEIGHT,
  borderRadius: "$7",
  padding: "$3",
});

export const AudioPlayerInfo = ({
  audiobookInfo,
  playing,
  color,
}: {
  audiobookInfo: AudiobookInfo;
  playing: boolean;
  color: string;
}) => {
  return (
    <XStack flex={1} gap="$3" alignItems="center">
      {audiobookInfo.cover ? (
        <Image
          width={42}
          height={42}
          resizeMode="contain"
          source={{
            uri: audiobookInfo.cover,
          }}
        />
      ) : null}
      <XStack alignItems="center" flex={1}>
        <YStack gap="$1" flex={1}>
          <Text fontSize={14} fontWeight={"$7"}>
            {audiobookInfo.title}
          </Text>
          <Text fontSize={14} color={"$gray10"}>
            {audiobookInfo.author}
          </Text>
        </YStack>

        <AudioPlayerControls
          playing={playing ? playing : false}
          color={color}
        />
      </XStack>
    </XStack>
  );
};

export const AudioPlayerControls = ({
  playing,
  color,
}: {
  playing: boolean;
  color: string;
}) => {
  return (
    <AudioPlayerControlsContainer>
      <View onPress={() => TrackPlayer.seekBy(-SKIP_INTERVAL)}>
        <Rewind size="$2" fill={color} />
      </View>

      <PlayPauseControl playing={playing} color={color} small />

      <View onPress={() => TrackPlayer.seekBy(SKIP_INTERVAL)}>
        <FastForward size="$2" fill={color} />
      </View>
    </AudioPlayerControlsContainer>
  );
};

const PlayPauseControl = ({
  playing,
  color,
  small = true,
}: {
  playing: boolean;
  color: string;
  small?: boolean;
}) => {
  return (
    <>
      {playing ? (
        <Animated.View
          key="pause"
          entering={EnterActionButton.duration(150)}
          exiting={ExitActionButton.duration(150)}
        >
          {small ? (
            <View onPress={() => TrackPlayer.pause()}>
              <Pause size="$3.5" fill={color} />
            </View>
          ) : (
            <CirlceButton
              bg={"$backgroundStrong"}
              h={"$7"}
              w={"$7"}
              onPress={() => TrackPlayer.pause()}
            >
              <Pause size="$3" fill={color} />
            </CirlceButton>
          )}
        </Animated.View>
      ) : (
        <Animated.View
          key="play"
          entering={EnterActionButton.duration(150)}
          exiting={ExitActionButton.duration(150)}
        >
          {small ? (
            <View onPress={() => TrackPlayer.play()}>
              <Play size="$3.5" fill={color} />
            </View>
          ) : (
            <CirlceButton
              bg={"$backgroundStrong"}
              h={"$7"}
              w={"$7"}
              onPress={() => TrackPlayer.play()}
            >
              <Play size="$3" fill={color} />
            </CirlceButton>
          )}
        </Animated.View>
      )}
    </>
  );
};

export const ProgressSlider = ({
  overallCurrentTime,
  totalDuration,
  color,
  trackProps,
  showThumb,
}: {
  overallCurrentTime: number;
  totalDuration: number;
  color: string;
  trackProps?: SliderTrackProps;
  showThumb: boolean;
}) => {
  return (
    <ProgressContainer>
      {!!overallCurrentTime && !!totalDuration ? (
        <Slider
          flex={1}
          min={0}
          defaultValue={[overallCurrentTime ? overallCurrentTime : 0]}
          max={totalDuration ? Math.floor(totalDuration) : 100}
          step={1}
          size={"$2"}
          disabled={!showThumb}
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

const AudioPlayerControlsContainer = styled(XStack, {
  alignItems: "center",
  gap: 16,
  justifyContent: "center",
});

export const CirlceButton = styled(Button, {
  borderRadius: "$12",
  padding: "$0",
  width: "$4",
  height: "$4",
  alignItems: "center",
  justifyContent: "center",
});

export default AudioPlayer;
