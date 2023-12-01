import { useMemo, useState } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  Pause,
  Play,
  Search,
} from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { Button, Popover, Separator, Text, useTheme } from "tamagui";

import { useUserMediaProgress } from "../../hooks/use-user-media-progress";
import { isAdminOrUpAtom, showPlayerAtom } from "../../state/app-state";
import { PodcastEpisodeExpanded } from "../../types/aba";
import { elapsedTime } from "../../utils/utils";
import ItemProgress from "../item-progress";
import { Flex } from "../layout/flex";
import { PodcastLabel } from "../podcast-label";
import { TouchableArea } from "../touchable/touchable-area";

import PlayingWidget from "./playing-widget";
import EpisodeTableRow from "./episode-table-row";

type SortKey = keyof PodcastEpisodeExpanded;

const episodeSorts = [
  {
    text: "Pub Date",
    value: "publishedAt",
  },
  {
    text: "Title",
    value: "title",
  },
  {
    text: "Season",
    value: "season",
  },
  {
    text: "Episode",
    value: "episode",
  },
];

const PodcastEpisodesTable = ({
  episodes,
  podcastId,
}: {
  episodes: PodcastEpisodeExpanded[];
  podcastId: string;
}) => {
  const isAdminOrUp = useAtomValue(isAdminOrUpAtom);
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

  const colors = useTheme();

  const renderItem = ({ item }: { item: PodcastEpisodeExpanded }) => {
    return <EpisodeTableRow item={item} podcastId={podcastId} />;
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
        <Popover placement="left">
          <Popover.Trigger asChild>
            <Button
              unstyled
              pressStyle={{
                opacity: 0.8,
              }}
            >
              <ArrowDownWideNarrow />
            </Button>
          </Popover.Trigger>
          <Popover.Content
            bg={colors.backgroundPress.get()}
            enterStyle={{ y: -10, opacity: 0 }}
            exitStyle={{ y: -10, opacity: 0 }}
            animation={[
              "quick",
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            p="$3"
            elevate
            justifyContent="flex-start"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <Flex space fill w={"$10"}>
              {episodeSorts.map((sort) => {
                return (
                  <TouchableArea
                    key={sort.value}
                    flexDirection="row"
                    alignItems="center"
                    gap="$2"
                    onPress={() => {
                      setSortKey(sort.value as SortKey);
                      if (sort.value === sortKey) {
                        setDescending((prev) => !prev);
                      }
                    }}
                  >
                    <Text>{sort.text}</Text>
                    {sortKey === sort.value ? (
                      descending ? (
                        <ArrowUp size={"$0.75"} />
                      ) : (
                        <ArrowDown size={"$0.75"} />
                      )
                    ) : null}
                  </TouchableArea>
                );
              })}
            </Flex>
          </Popover.Content>
        </Popover>
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

export default PodcastEpisodesTable;
