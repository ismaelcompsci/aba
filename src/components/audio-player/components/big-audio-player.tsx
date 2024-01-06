import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import FastImage from "react-native-fast-image";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsPlaying } from "react-native-track-player";
import {
  Bookmark,
  ChevronDown,
  Headphones,
  ListOrdered,
  ListVideo,
} from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAtomValue, useSetAtom } from "jotai";
import { H3, H6, useTheme } from "tamagui";

import { useImageColors } from "../../../hooks/use-image-colors";
import { useOrientation } from "../../../hooks/use-orientation";
import { bookmarksModalAtom, showPlayerAtom } from "../../../state/app-state";
import { appThemeAtom } from "../../../state/local-state";
import { AnimatedFlex, Flex } from "../../layout/flex";
import AudioPlayerMore from "../../menus/audio-player-more";
import { chaptersModalAtom } from "../../modals/chapter-modal";
import { playlistModalAtom } from "../../modals/playlist-modal";
import { TouchableArea } from "../../touchable/touchable-area";

import BigAudioPlayerControls from "./big-audio-player-controls";
import PlaybackSpeedControls from "./playback-speed-controls";
import { ProgressSlider } from "./progress-slider";
import { AudiobookInfo } from "./small-audio-player";

const BigAudioPlayer = ({
  audiobookInfo,
  closePlayer,
  libraryItemId,
}: {
  libraryItemId: string;
  audiobookInfo: AudiobookInfo;
  closePlayer?: () => void;
}) => {
  const { width, height } = useWindowDimensions();
  const { bottom, top, left, right } = useSafeAreaInsets();
  const orientation = useOrientation();
  const showPlayer = useAtomValue(showPlayerAtom);

  return (
    <Flex
      $theme-oled={{
        backgroundColor: "$background",
      }}
      bg={"$backgroundPress"}
      width={width}
      height={height}
    >
      <BigAudioPlayerBackground cover={audiobookInfo.cover}>
        <Flex
          fill
          paddingTop={orientation === "PORTRAIT" ? top : top + 20}
          pl={left ? left : "$4"}
          pr={right ? right : "$4"}
          pb={orientation === "PORTRAIT" ? bottom : bottom + 40}
          justifyContent="space-between"
          w={"100%"}
        >
          <Flex row ai={"center"} width={"100%"} justifyContent="space-between">
            <TouchableArea
              borderRadius={"$12"}
              padding={"$0"}
              width={"$4"}
              height={"$4"}
              alignItems={"center"}
              justifyContent={"center"}
              bg="$background"
              onPress={() => closePlayer && closePlayer()}
            >
              <ChevronDown />
            </TouchableArea>
            <AudioPlayerMore closePlayer={closePlayer} />
          </Flex>
          {/* IMAGE */}

          <AudioPlayerImage cover={audiobookInfo.cover} />
          <Flex space={"$2"}>
            {/* INFO */}
            <Flex>
              <H3>{audiobookInfo.title}</H3>
              <H6>{audiobookInfo.author}</H6>
            </Flex>
            {/* PROGRESS */}
            <ProgressSlider audiobookInfo={audiobookInfo} />
          </Flex>
          {/* CONTROLS */}
          <BigAudioPlayerControls />
          {/* ACTIONS */}
          <Flex row justifyContent="space-between" w={"100%"}>
            <ShowBookmarksButton libraryItemId={libraryItemId} />
            <PlaybackSpeedControls />
            <ShowChaptersButton />
            {showPlayer.playlist ? <ShowPlaylistButton /> : null}
          </Flex>
        </Flex>
      </BigAudioPlayerBackground>
    </Flex>
  );
};

const AudioPlayerImage = ({ cover }: { cover?: string | null }) => {
  const { playing } = useIsPlaying();

  const { width } = useWindowDimensions();
  const orientation = useOrientation();
  const imageWidth = orientation === "PORTRAIT" ? width * 0.9 : 150;
  const imageHeight = imageWidth;

  const scale = useSharedValue(1);

  useEffect(() => {
    if (playing) {
      scale.value = withTiming(1);
    } else {
      scale.value = withTiming(0.65);
    }
  }, [playing]);

  return (
    <AnimatedFlex
      jc={"center"}
      ai="center"
      style={[
        {
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.32,
          shadowRadius: 5.46,
          elevation: 24,
        },
        { transform: [{ scale }] },
      ]}
      w={"100%"}
    >
      {cover ? (
        <FastImage
          style={{
            width: imageWidth,
            height: imageHeight,
            borderRadius: 16,
          }}
          resizeMode="contain"
          source={{
            uri: cover,
          }}
        />
      ) : (
        <Headphones
          size={imageHeight}
          style={{
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
          }}
        />
      )}
    </AnimatedFlex>
  );
};

const ShowBookmarksButton = ({ libraryItemId }: { libraryItemId: string }) => {
  const setBookmarksModalAtom = useSetAtom(bookmarksModalAtom);

  return (
    <TouchableArea
      borderRadius={"$12"}
      padding={"$0"}
      width={"$4"}
      height={"$4"}
      alignItems={"center"}
      justifyContent={"center"}
      hitSlop={24}
      onPress={() =>
        setBookmarksModalAtom({ open: true, libraryItemId: libraryItemId })
      }
    >
      <Bookmark />
    </TouchableArea>
  );
};

const ShowChaptersButton = () => {
  const setChaptersModal = useSetAtom(chaptersModalAtom);

  return (
    <TouchableArea
      borderRadius={"$12"}
      width={"$4"}
      height={"$4"}
      alignItems={"center"}
      justifyContent={"center"}
      onPress={() => setChaptersModal({ open: true })}
    >
      <ListOrdered />
    </TouchableArea>
  );
};

const ShowPlaylistButton = () => {
  const setShowPlaylistModal = useSetAtom(playlistModalAtom);

  return (
    <TouchableArea
      borderRadius={"$12"}
      width={"$4"}
      height={"$4"}
      alignItems={"center"}
      justifyContent={"center"}
      onPress={() => setShowPlaylistModal({ open: true })}
    >
      <ListVideo />
    </TouchableArea>
  );
};

const BigAudioPlayerBackground = ({
  children,
  cover,
}: {
  children: React.ReactNode;
  cover?: string | null;
}) => {
  const appScheme = useAtomValue(appThemeAtom);
  const { height } = useWindowDimensions();
  const colors = useTheme();
  const { colorTwo } = useImageColors(cover);

  if (appScheme.scheme === "oled") {
    return (
      <Flex height={height} borderRadius={"$7"} bg="$backgroundPress">
        {children}
      </Flex>
    );
  } else {
    const bg = colors.backgroundPress.get();
    const gColor = colorTwo.value === "" ? bg : colorTwo.value;
    return (
      <LinearGradient
        style={{ height: height }}
        colors={[gColor, bg]}
        locations={[0, 0.7]}
      >
        {children}
      </LinearGradient>
    );
  }
};

export default BigAudioPlayer;
