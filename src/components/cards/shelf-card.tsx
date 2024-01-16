import { useMemo } from "react";
import { Image } from "react-native";
import FastImage from "react-native-fast-image";
import { FadeIn } from "react-native-reanimated";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { Book, Pause, Play } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { Card, Text, useTheme } from "tamagui";

// import tinycolor from "tinycolor2";
import { IS_IOS } from "../../constants/consts";
import { useImageColors } from "../../hooks/use-image-colors";
import { showPlayerAtom } from "../../state/app-state";
import { LibraryItemMinified } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { elapsedMiniTime, getGradient } from "../../utils/utils";
import { Flex } from "../layout/flex";
import { MiniProgressBar } from "../library/mini-progress-bar";
import BookMoreMenu from "../menus/book-more-menu";
import { TouchableArea } from "../touchable/touchable-area";
import { withAnimated } from "../touchable/with-animated";

const AnimatedCard = withAnimated(Card);

export const ShelfCard = ({
  item,
  token,
  serverAddress,
  isCoverSquareAspectRatio,
}: {
  item: LibraryItemMinified;
  token: string;
  serverAddress: string;
  isCoverSquareAspectRatio: boolean;
}) => {
  const cover = getItemCoverSrc(item, null, token, serverAddress);

  const cardWidth = 248;
  const cardHeight = 324;

  const imageWidth = isCoverSquareAspectRatio ? cardWidth : 140;
  const imageHeight = isCoverSquareAspectRatio
    ? undefined
    : cardHeight / 2 + 40;

  const colors = useTheme();

  const isColorTooBrightForBackground = false;
  const numTracks = "numTracks" in item.media ? !!item.media.numTracks : false;
  const isPodcast = item.mediaType === "podcast";

  const releaseDate =
    "releaseDate" in item.media.metadata
      ? item.media.metadata.releaseDate
      : null;

  const formattedReleaseDate = useMemo(() => {
    if (!releaseDate) return null;
    let _format = "MMM d";
    const publishedAt = new Date(releaseDate);

    if (publishedAt.getFullYear() - new Date().getFullYear() > 1) {
      _format = "LL/dd/yyyy";
    }

    return format(publishedAt, _format);
  }, [item.id]);

  const cleanedDescription = useMemo(() => {
    const regex = /(<([^>]+)>)/gi;
    const result = item.recentEpisode?.description
      ? item.recentEpisode?.description.replace(regex, "")
      : item.media.metadata.description;

    return result;
  }, [item.id]);

  const isAudio = isPodcast || numTracks;

  const onPress = () => {
    if (item.recentEpisode) {
      router.push(`/book/${item.id}/${item.recentEpisode.id}`);
    } else {
      router.push(`/book/${item.id}`);
    }
  };

  const read = () => {
    if (isAudio) return;
    router.push(`/reader/${item.id}`);
  };

  return (
    <AnimatedCard
      entering={FadeIn.duration(500)}
      bordered
      h={cardHeight}
      w={cardWidth}
      overflow="hidden"
      onPress={onPress}
      accessible
      accessibilityLabel={`${item.media.metadata.title} card`}
      accessibilityValue={{
        text: item.media.metadata.description ?? "Unkown book",
      }}
    >
      {/* IMAGE */}
      <Flex top={0} jc={"center"} alignItems="center">
        <Image
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: cardWidth,
            height: cardHeight,
          }}
          blurRadius={15}
          resizeMode="cover"
          source={{
            uri: cover || "",
          }}
        />
        {cover ? (
          <FastImage
            style={{
              width: imageWidth,
              height: imageHeight,
              borderRadius: 8,
              aspectRatio: 1,
            }}
            resizeMode="contain"
            source={{
              uri: cover,
            }}
          />
        ) : null}
      </Flex>
      {/* info */}
      <Flex pos={"absolute"} bottom={0}>
        {/*  */}
        {cover ? (
          <ShelfCardBackground
            cardHeight={cardHeight}
            cardWidth={cardWidth}
            cover={cover}
          />
        ) : null}
        <Flex minHeight={cardHeight / 2.8} width={cardWidth}>
          <Flex px="$3.5" width={cardWidth} marginTop={-30} grow>
            {cover ? (
              <FastImage
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  position: "absolute",
                  top: -50,
                  left: 10,
                }}
                resizeMode="contain"
                source={{
                  uri: cover,
                }}
              />
            ) : null}
            <Flex>
              <Text
                color={isColorTooBrightForBackground ? "black" : "$gray10"}
                fontSize={10}
              >
                {isAudio
                  ? isPodcast
                    ? `RESUME${
                        formattedReleaseDate ? " • " + formattedReleaseDate : ""
                      }`
                    : "RESUME"
                  : "READ"}
              </Text>
              <Text
                numberOfLines={1}
                fontWeight={"700"}
                color={isColorTooBrightForBackground ? "black" : "white"}
              >
                {item.recentEpisode?.title
                  ? item.recentEpisode?.title
                  : item.media.metadata.title}
              </Text>
              <Text
                fontFamily="heading"
                color={isColorTooBrightForBackground ? "black" : "gray"}
                numberOfLines={3}
              >
                {cleanedDescription}
              </Text>
            </Flex>
          </Flex>
          <Flex grow />
          <Flex
            height={"$5"}
            row
            px="$3.5"
            justifyContent="space-between"
            alignItems="center"
          >
            <Flex
              backgroundColor={"$gray12"}
              borderRadius={"$6"}
              py={3}
              px="$1.5"
            >
              {isAudio ? (
                <PlayCapsule item={item} fill={colors.background.get()} />
              ) : (
                <TouchableArea
                  flexDirection="row"
                  gap="$1.5"
                  alignItems="center"
                  py={3}
                  px={3}
                  onPress={read}
                >
                  <Book size={12} color={"$background"} />
                  <MiniProgressBar
                    itemId={item.id}
                    episodeId={item.recentEpisode?.id}
                  />
                  <Text fontSize={12} color={colors.background.get()}>
                    Read
                  </Text>
                </TouchableArea>
              )}
            </Flex>
            <BookMoreMenu
              itemId={item.id}
              episodeId={item.recentEpisode?.id}
              vertical={false}
            />
          </Flex>
        </Flex>
      </Flex>
    </AnimatedCard>
  );
};

const ShelfCardBackground = ({
  cardHeight,
  cardWidth,
  cover,
}: {
  cardHeight: number;
  cover: string;
  cardWidth: number;
}) => {
  const { colorTwo, colorOne, isLoading } = useImageColors(cover);
  const gradientColor = IS_IOS ? colorOne.value : colorTwo.value;
  const gColors = getGradient(gradientColor);

  const colors = useTheme();

  if (isLoading || !gColors) {
    const backupColors = getGradient(colors.background.val);

    if (!backupColors) return null;

    return (
      <LinearGradient
        colors={backupColors}
        locations={[0, 0.9, 1]}
        start={{ x: 0, y: 0.6 }}
        end={{ x: 0, y: 0 }}
        style={{
          height: cardHeight,
          width: cardWidth,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  } else {
    return (
      <LinearGradient
        colors={gColors}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.6 }}
        end={{ x: 0, y: 0 }}
        style={{
          height: cardHeight,
          width: cardWidth,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }
};

const PlayCapsule = ({
  item,
  fill,
}: {
  fill: string;
  item: LibraryItemMinified;
}) => {
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;

  const duration = elapsedMiniTime(
    item.recentEpisode
      ? item.recentEpisode.audioFile.duration
      : // @ts-ignore
        item.media.duration
  );

  const play = () => {
    // play
    if (isPlaying) {
      if (showPlayer.libraryItemId === item.id) {
        TrackPlayer.pause();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: item.id,
          episodeId: item.recentEpisode?.id,
        });
      }
    } else {
      if (showPlayer.playing && showPlayer.libraryItemId === item.id) {
        TrackPlayer.play();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: item.id,
          episodeId: item.recentEpisode?.id,
        });
      }
    }
  };

  const isCurrent =
    showPlayer.libraryItemId === item.id &&
    item.recentEpisode?.id === showPlayer.episodeId;

  return (
    <TouchableArea
      flexDirection="row"
      gap="$1.5"
      alignItems="center"
      py={3}
      px={3}
      onPress={play}
    >
      {isPlaying && isCurrent ? (
        <Pause size={12} fill={fill} color={"$background"} />
      ) : (
        <Play size={12} fill={fill} color={"$background"} />
      )}

      <MiniProgressBar itemId={item.id} episodeId={item.recentEpisode?.id} />
      <Text fontSize={12} color={"$background"}>
        {duration}
      </Text>
    </TouchableArea>
  );
};
