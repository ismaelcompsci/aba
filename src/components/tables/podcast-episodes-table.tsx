import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList } from "react-native";
import { ZoomIn, ZoomOut } from "react-native-reanimated";
import {
  ArrowDown,
  ArrowDownWideNarrow,
  ArrowUp,
  Search,
  X,
} from "@tamagui/lucide-icons";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as Burnt from "burnt";
import { useAtomValue, useSetAtom } from "jotai";
import { Button, Popover, Separator, Spinner, Text, useTheme } from "tamagui";

import { useAudioBookShelfSocket } from "../../context/socket-context";
import { isAdminOrUpAtom, requestInfoAtom } from "../../state/app-state";
import {
  PodcastEpisodeDownload,
  PodcastEpisodeExpanded,
} from "../../types/aba";
import { AnimatedFlex, Flex } from "../layout/flex";
import { podcastEpisodeSearchModalAtom } from "../modals/podcast-episode-search-modal";
import { TouchableArea } from "../touchable/touchable-area";

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
  rssFeedUrl,
  libraryItemId,
}: {
  episodes: PodcastEpisodeExpanded[];
  podcastId: string;
  rssFeedUrl?: string | null;
  libraryItemId: string;
}) => {
  const setPodcastEpisodeSearchModal = useSetAtom(
    podcastEpisodeSearchModalAtom
  );
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
    [sortKey, descending, episodes]
  );

  const colors = useTheme();

  const renderItem = ({ item }: { item: PodcastEpisodeExpanded }) => {
    return <EpisodeTableRow item={item} podcastId={podcastId} />;
  };

  return (
    <Flex fill pt="$4">
      <PodcastDownloadWidget libraryItemId={libraryItemId} />
      <Flex row space pb="$2">
        <Text fontSize={20} fontWeight={"700"}>
          Episodes ({episodes.length})
        </Text>
        <Flex grow />
        {isAdminOrUp ? (
          <TouchableArea
            onPress={() =>
              setPodcastEpisodeSearchModal({
                open: true,
                rssFeed: rssFeedUrl,
                episodes: episodes,
              })
            }
          >
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
      <Separator pt="$1.5" />
      <FlatList
        data={sortedEpisodes}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Separator pt="$1.5" />}
        renderItem={renderItem}
      />
      <Separator pt="$1.5" />
    </Flex>
  );
};

const PodcastDownloadWidget = ({
  libraryItemId,
}: {
  libraryItemId: string;
}) => {
  const socket = useAudioBookShelfSocket();
  const isAdminOrUp = useAtomValue(isAdminOrUpAtom);
  const requestInfo = useAtomValue(requestInfoAtom);

  const [episodeDownloadQueue, setEpisodeDownloadQueue] = useState<
    PodcastEpisodeDownload[]
  >([]);

  const [currentDownload, setCurrentDownload] =
    useState<PodcastEpisodeDownload | null>(null);

  const queryClient = useQueryClient();

  const episodeDownloadQueued = (episode: PodcastEpisodeDownload) => {
    console.log("[SOCKET] download queued", episode.episodeDisplayTitle);

    if (episode.libraryItemId === libraryItemId) {
      setEpisodeDownloadQueue((prev) => [...prev, episode]);
    }
  };

  const episodeDownloadStarted = (episode: PodcastEpisodeDownload) => {
    console.log("[SOCKET] download started", episode.episodeDisplayTitle);
    if (episode.libraryItemId === libraryItemId) {
      setEpisodeDownloadQueue((prev) => [
        ...prev.filter((v) => v.id !== episode.id),
      ]);
      setCurrentDownload(episode);
    }
  };

  const episodeDownloadFinished = (episode: PodcastEpisodeDownload) => {
    console.log("[SOCKET] download finished", episode.episodeDisplayTitle);
    if (episode.libraryItemId === libraryItemId) {
      setEpisodeDownloadQueue((prev) => [
        ...prev.filter((v) => v.id !== episode.id),
      ]);
      setCurrentDownload(null);
    }
  };

  const episodeDownloadQueueUpdated = async (update: {
    currentDownload: PodcastEpisodeDownload;
    queue: PodcastEpisodeDownload[];
  }) => {
    console.log(update);

    if (update.currentDownload && !update.queue.length) {
      await invalidateQueries();
    }
  };

  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["personalized-library-view"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["latest-episodes"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["bookItem"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["library-items"],
      }),
    ]);
  };

  const clearQueue = async () => {
    try {
      await axios.get(
        `${requestInfo.serverAddress}/api/podcasts/${libraryItemId}/clear-queue`,
        {
          headers: {
            Authorization: `Bearer ${requestInfo.token}`,
          },
        }
      );

      Burnt.toast({
        title: "Download queue cleared.",
      });

      setEpisodeDownloadQueue([]);
    } catch (error) {
      console.log("[PODCAST_EPISODES_TABLE] clearQueue error", error);
    }
  };

  useEffect(() => {
    socket?.on("episode_download_queued", episodeDownloadQueued);
    socket?.on("episode_download_started", episodeDownloadStarted);
    socket?.on("episode_download_finished", episodeDownloadFinished);
    socket?.on("episode_download_queue_updated", episodeDownloadQueueUpdated);

    return () => {
      socket?.off("episode_download_queued");
      socket?.off("episode_download_started");
      socket?.off("episode_download_finished");
      socket?.off("episode_download_queue_updated");
    };
  }, []);

  return (
    <Flex space="$2" py="$2" overflow="hidden">
      {episodeDownloadQueue.length ? (
        <AnimatedFlex
          entering={ZoomIn}
          exiting={ZoomOut}
          bg="$blue4"
          p={"$2.5"}
          borderRadius={"$4"}
          row
          gap="$4"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text>
            ({episodeDownloadQueue.length}){" "}
            {episodeDownloadQueue.length === 1 ? "Episode" : "Episodes"} queued
            for download
          </Text>
          {isAdminOrUp ? (
            <TouchableArea
              onPress={() =>
                Alert.alert(
                  "Confirm",
                  `Are you sure you want to clear episode download queue?`,
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Okay",
                      style: "destructive",
                      onPress: async () => await clearQueue(),
                    },
                  ],
                  {
                    cancelable: true,
                  }
                )
              }
            >
              <X size={14} />
            </TouchableArea>
          ) : null}
        </AnimatedFlex>
      ) : null}

      {currentDownload ? (
        <AnimatedFlex
          entering={ZoomIn}
          exiting={ZoomOut}
          bg="$blue4"
          p={"$2.5"}
          borderRadius={"$4"}
          row
          gap="$4"
          alignItems="center"
        >
          <Spinner />
          <Text numberOfLines={1}>
            Downloading &quot;{currentDownload?.episodeDisplayTitle}&quot;
          </Text>
        </AnimatedFlex>
      ) : null}
    </Flex>
  );
};

export default PodcastEpisodesTable;
