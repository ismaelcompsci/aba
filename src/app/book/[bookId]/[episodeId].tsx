import { useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { Image, Spinner, Text, useTheme } from "tamagui";

import { VirtualizedList } from "../../../components/custom-components/virtual-scroll-view";
import ItemProgress from "../../../components/item-progress";
import BackHeader from "../../../components/layout/back-header";
import { Flex } from "../../../components/layout/flex";
import { Screen } from "../../../components/layout/screen";
import BookMoreMenu from "../../../components/menus/book-more-menu";
import { PodcastLabel } from "../../../components/podcast-label";
import { TouchableArea } from "../../../components/touchable/touchable-area";
import { useAppSafeAreas } from "../../../hooks/use-app-safe-areas";
import {
  serverAddressAtom,
  showPlayerAtom,
  userTokenAtom,
} from "../../../state/app-state";
import { LibraryItemExpanded } from "../../../types/aba";
import { getItemCoverSrc } from "../../../utils/api";
import { dateDistanceFromNow, elapsedTime } from "../../../utils/utils";

function EpisodePage() {
  const userToken = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);
  const { top } = useAppSafeAreas();
  const { episodeId, bookId } = useLocalSearchParams();
  const colors = useTheme();
  const { width } = useWindowDimensions();

  const { data, isLoading } = useQuery({
    queryKey: ["podcast_episode", bookId, episodeId],
    queryFn: async () => {
      const response: { data: LibraryItemExpanded } = await axios.get(
        `${serverAddress}/api/items/${bookId}?expanded=1`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const libraryItem = response.data;

      if (!libraryItem) {
        console.error("[EPISODE_ID_PODCAST] no library item found", bookId);
        return router.push("/");
      }

      const episode =
        "episodes" in libraryItem.media
          ? libraryItem.media.episodes.find((ep) => ep.id === episodeId)
          : undefined;

      if (!episode) {
        console.error("[EPISODE_ID_PODCAST] no episdoe found", episodeId);
        router.push(`/book/${bookId}`);
      }

      return {
        libraryItem,
        episode,
      };
    },
  });

  const coverUrl = getItemCoverSrc(
    data?.libraryItem,
    null,
    userToken,
    serverAddress
  );

  const imageWidth = 84;
  const imageHeight = imageWidth;

  // @ts-ignore
  const duration = elapsedTime(data?.episode.duration);
  const episodeNumber = data?.episode?.episode;
  const season = data?.episode?.season;
  const episodeType =
    data?.episode?.episodeType === "full" ? null : data?.episode?.episodeType;

  return (
    <Screen edges={["bottom", "left", "right"]}>
      <BackHeader alignment="center" mx={16} pt={top + 16} pb={16}>
        {!isLoading && (episodeNumber || season || episodeType) ? (
          <Text numberOfLines={1}>
            Episode{" "}
            {episodeNumber
              ? episodeNumber
              : season
              ? season
              : episodeType
              ? episodeType
              : ""}
          </Text>
        ) : (
          <Text>{data?.episode?.title}</Text>
        )}
      </BackHeader>
      <VirtualizedList>
        {isLoading ? (
          <Spinner />
        ) : (
          <Flex fill px={"$4"} space>
            <Flex row space>
              {coverUrl ? (
                <Image
                  borderRadius={"$4"}
                  width={imageWidth}
                  height={imageHeight}
                  resizeMode="cover"
                  source={{ uri: coverUrl }}
                />
              ) : null}
              <Flex fill>
                <Text
                  numberOfLines={2}
                  textDecorationLine="underline"
                  color="$gray11"
                  onPress={() => router.push(`/book/${data?.libraryItem.id}`)}
                  pressStyle={{
                    opacity: 0.8,
                  }}
                >
                  {data?.libraryItem.media.metadata.title}
                </Text>
                {data?.episode?.publishedAt ? (
                  <Text color={"$gray11"}>
                    {dateDistanceFromNow(data?.episode?.publishedAt)}
                  </Text>
                ) : null}
              </Flex>
            </Flex>
            <Flex>
              <Text fontSize={18}>{data?.episode?.title}</Text>
            </Flex>
            <Flex row alignItems="center" gap="$2">
              {episodeNumber ? (
                <PodcastLabel label={`Episode #${episodeNumber}`} />
              ) : null}
              {season ? <PodcastLabel label={`Season #${season}`} /> : null}
              {episodeType ? <PodcastLabel label={`${episodeType}`} /> : null}
              {duration ? <PodcastLabel label={`${duration}`} /> : null}
            </Flex>
            <Flex row alignItems="center" gap="$2">
              {data?.libraryItem.id ? (
                <PodcastEpisodePlayButton
                  itemId={data?.libraryItem.id}
                  episodeId={episodeId as string}
                />
              ) : null}
              <Flex grow />
              {data ? (
                <ItemProgress
                  id={data.libraryItem.id}
                  episodeId={data.episode?.id}
                  radius={20}
                  activeStrokeWidth={5}
                  inActiveStrokeWidth={6}
                  progressValueFontSize={14}
                  inActiveStrokeOpacity={0.4}
                  circleBackgroundColor={colors.backgroundPress.get()}
                  activeStrokeColor={colors.color.get()}
                />
              ) : null}
              {data?.libraryItem.id ? (
                <BookMoreMenu
                  itemId={data?.libraryItem.id}
                  episodeId={data?.episode?.id}
                  title={data?.episode?.title}
                  isPodcast={false}
                />
              ) : null}
            </Flex>
            {data?.episode?.description ? (
              <RenderHTML
                source={{ html: data?.episode?.description }}
                contentWidth={width}
                baseStyle={{
                  color: colors.color.get(),
                }}
              />
            ) : null}
          </Flex>
        )}
      </VirtualizedList>
    </Screen>
  );
}

const PodcastEpisodePlayButton = ({
  itemId,
  episodeId,
}: {
  itemId: string;
  episodeId: string;
}) => {
  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);

  const playerPlayPress = () => {
    if (isPlaying) {
      if (
        showPlayer.libraryItemId === itemId &&
        showPlayer.episodeId === episodeId
      ) {
        TrackPlayer.pause();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: itemId,
          episodeId,
        });
      }
    } else {
      if (
        showPlayer.playing &&
        showPlayer.libraryItemId === itemId &&
        showPlayer.episodeId === episodeId
      ) {
        TrackPlayer.play();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: itemId,
          episodeId,
        });
      }
    }
  };

  return (
    <TouchableArea
      borderRadius={"$4"}
      bg={"$color"}
      flexDirection="row"
      alignItems="center"
      jc={"center"}
      px={"$9"}
      flex={1}
      minHeight={"$4"}
      gap={"$2"}
      onPress={playerPlayPress}
    >
      {isPlaying &&
      showPlayer.libraryItemId === itemId &&
      episodeId === showPlayer.episodeId ? (
        <>
          <Pause color="$background" />
          <Text color="$background">Pause</Text>
        </>
      ) : (
        <>
          <Play size="$1" color={"$background"} />
          <Text color={"$background"}>Stream</Text>
        </>
      )}
      {/* <Play color={"$background"} /> */}
      {/* <Text color={"$background"}>Stream {duration}</Text> */}
    </TouchableArea>
  );
};

export default EpisodePage;
