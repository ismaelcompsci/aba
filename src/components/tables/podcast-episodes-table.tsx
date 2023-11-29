import { useMemo, useState } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import {
  ArrowDownWideNarrow,
  Filter,
  Pause,
  Play,
  Search,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { Separator, Text, useTheme } from "tamagui";

import { isAdminOrUpAtom, showPlayerAtom } from "../../state/app-state";
import { PodcastEpisodeExpanded } from "../../types/aba";
import { secondsToTimestamp } from "../../utils/utils";
import { Flex, FlexProps } from "../layout/flex";
import { TouchableArea } from "../touchable/touchable-area";

import PlayingWidget from "./playing-widget";

type SortKey = keyof PodcastEpisodeExpanded;

const PodcastEpisodesTable = ({
  episodes,
  podcastId,
}: {
  episodes: PodcastEpisodeExpanded[];
  podcastId: string;
}) => {
  const isAdminOrUp = useAtomValue(isAdminOrUpAtom);
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const [sortKey, setSortKey] = useState<SortKey>("publishedAt");
  const [descending, setDescending] = useState(true);

  const sortedEpisodes = useMemo(
    () =>
      episodes.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (descending) {
          return String(bValue).localeCompare(String(aValue), undefined, {
            sensitivity: "base",
            numeric: true,
          });
        }

        return String(aValue).localeCompare(String(bValue), undefined, {
          sensitivity: "base",
          numeric: true,
        });
      }),
    [sortKey, descending]
  );

  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const gray12 = theme.gray12.get();
  const gray8 = theme.gray8.get();
  const color = theme.color.get();

  const onEpisodePress = (episodeId: string) => {
    router.push(`/book/${podcastId}/${episodeId}`);
  };

  const onPlayItem = (episodeId: string) => {
    const sameEpisode = episodeId === showPlayer.episodeId;

    if (isPlaying && sameEpisode) {
      TrackPlayer.pause();
      return;
    }

    if (showPlayer.playing && sameEpisode) {
      TrackPlayer.play();
      return;
    }

    setShowPlayer({
      playing: true,
      libraryItemId: podcastId,
      episodeId: episodeId,
    });
  };

  const renderItem = ({ item }: { item: PodcastEpisodeExpanded }) => {
    const subtitle = item.subtitle || item.description || "";
    const duration = secondsToTimestamp(item.duration);
    const episodeNumber = item.episode;
    const season = item.season;
    const episodeType = item.episodeType === "full" ? null : item.episodeType;

    return (
      <TouchableArea hapticFeedback onPress={() => onEpisodePress(item.id)}>
        <Flex py="$2" space="$1.5">
          <Text fontSize={17}>{item.title}</Text>
          <RenderHTML
            contentWidth={width}
            baseStyle={{
              overflow: "hidden",
              maxHeight: 50,
              color: gray12,
            }}
            source={{ html: subtitle }}
            enableExperimentalMarginCollapsing
            enableExperimentalBRCollapsing
          />
          <Flex row alignItems="center" gap="$2">
            {episodeNumber ? (
              <Label label={`Episode #${episodeNumber}`} />
            ) : null}
            {season ? <Label label={`Season #${season}`} /> : null}
            {episodeType ? <Label label={`${episodeType}`} /> : null}
          </Flex>
          <Flex row alignItems="center" pt="$4" space>
            <TouchableArea
              alignItems="center"
              borderWidth={1}
              borderColor={gray8}
              paddingHorizontal="$4"
              paddingVertical="$2"
              flexDirection="row"
              gap="$4"
              borderRadius="$6"
              onPress={() => onPlayItem(item.id)}
            >
              {showPlayer.playing &&
              showPlayer.episodeId === item.id &&
              isPlaying ? (
                <>
                  <Pause size={18} fill={color} />
                  <Text>Playing</Text>
                </>
              ) : (
                <>
                  <Play size={18} fill={color} />
                  <Text>{duration}</Text>
                </>
              )}
            </TouchableArea>
            {showPlayer.playing && item.id === showPlayer.episodeId ? (
              <PlayingWidget />
            ) : null}
            <Flex grow />
          </Flex>
        </Flex>
      </TouchableArea>
    );
  };
  return (
    <Flex fill pt="$4">
      <Flex row space pb="$2">
        <Text fontSize={20}>Episodes ({episodes.length})</Text>
        <Flex grow />
        {isAdminOrUp ? (
          <TouchableArea>
            <Search size={"$1"} />
          </TouchableArea>
        ) : null}
        <TouchableArea>
          <Filter size={"$1"} />
        </TouchableArea>
        <TouchableArea>
          <ArrowDownWideNarrow />
        </TouchableArea>
      </Flex>
      <FlatList
        data={sortedEpisodes}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Separator pt="$1.5" />}
        renderItem={renderItem}
      />
    </Flex>
  );
};

const Label = ({
  label,
  ...rest
}: FlexProps & {
  label: string;
}) => {
  return (
    <Flex
      borderRadius={8}
      bg={"$backgroundFocus"}
      padding={2}
      alignItems="center"
      px={4.5}
      {...rest}
    >
      <Text textAlign="center" fontSize={11}>
        {label}
      </Text>
    </Flex>
  );
};

export default PodcastEpisodesTable;
