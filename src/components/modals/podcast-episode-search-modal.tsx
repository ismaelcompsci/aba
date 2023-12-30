import { useEffect, useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { usePathname } from "expo-router";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button, Separator, Spinner, Text } from "tamagui";

import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { requestInfoAtom } from "../../state/app-state";
import {
  PodcastEpisodeExpanded,
  PodcastFeed,
  PodcastFeedEpisode,
} from "../../types/aba";
import { dateDistanceFromNow } from "../../utils/utils";
import {
  AppBottomSheetModal,
  HandleBar,
} from "../custom-components/bottom-sheet-modal";
import { Dot } from "../dot";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { TouchableArea } from "../touchable/touchable-area";

type PodcastEpisodeSearchModalAtom = {
  open: boolean;
  rssFeed?: string | null;
  episodes?: PodcastEpisodeExpanded[];
};

export const podcastEpisodeSearchModalAtom =
  atom<PodcastEpisodeSearchModalAtom>({ open: false });

export const podcastFeedEpisodesSelectedAtom = atom<{ [key: string]: boolean }>(
  {}
);

export const podcastFeedItemEpisodesDownloadedAtom = atom<{
  [key: string]: boolean;
}>({});

export const PodcastEpisodeSearchModal = () => {
  const [podcastEpisodeSearchModal, setPodcastEpisodeSearchModal] = useAtom(
    podcastEpisodeSearchModalAtom
  );
  const setPodcastFeedEpisodesSelected = useSetAtom(
    podcastFeedEpisodesSelectedAtom
  );

  const setPodcastFeedItemEpisodesDownloaded = useSetAtom(
    podcastFeedItemEpisodesDownloadedAtom
  );

  const requestInfo = useAtomValue(requestInfoAtom);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const { data: podcastFeedEpisodes, isLoading } = useQuery({
    queryKey: [podcastEpisodeSearchModal.rssFeed, "rss-feed-search"],
    queryFn: async () => {
      const response: { data: { podcast: PodcastFeed } } = await axios.post(
        `${requestInfo.serverAddress}/api/podcasts/feed`,
        { rssFeed: podcastEpisodeSearchModal.rssFeed },
        { headers: { Authorization: `Bearer ${requestInfo.token}` } }
      );

      const selectedEpisodesMap: { [key: string]: boolean } = {};
      for (let i = 0; i < response.data.podcast.episodes.length; i++) {
        selectedEpisodesMap[String(i)] = false;
      }

      const downloadedEpisodeMap: { [key: string]: boolean } = {};
      podcastEpisodeSearchModal.episodes?.forEach((ep) => {
        if (ep.enclosure) downloadedEpisodeMap[ep.enclosure.url] = true;
      });

      setPodcastFeedItemEpisodesDownloaded(downloadedEpisodeMap);

      setPodcastFeedEpisodesSelected(selectedEpisodesMap);

      return response.data.podcast.episodes;
    },
  });

  const onClose = () => {
    setPodcastEpisodeSearchModal({ open: false });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: PodcastFeedEpisode;
    index: number;
  }) => {
    return <PodcastEpisodeSearchItem item={item} index={index} />;
  };

  useEffect(() => {
    return () => {
      setPodcastFeedItemEpisodesDownloaded({});
      setPodcastFeedEpisodesSelected({});
    };
  }, []);

  if (!podcastEpisodeSearchModal.open) return null;

  return (
    <AppBottomSheetModal
      ref={bottomSheetRef}
      fullScreen
      hideHandlebar
      renderBehindTopInset
      onClose={onClose}
    >
      <Screen edges={["top"]} px="$2">
        <HandleBar containerFlexStyles={{ height: 30 }} />
        {isLoading ? (
          <Flex fill centered>
            <Spinner />
          </Flex>
        ) : (
          <FlashList
            data={podcastFeedEpisodes}
            showsVerticalScrollIndicator={false}
            onScroll={(e) => {
              if (e.nativeEvent.contentOffset.y < -160) {
                bottomSheetRef.current?.close();
              }
            }}
            ItemSeparatorComponent={() => <Separator my="$2" />}
            ListEmptyComponent={
              <Flex>
                <Text>Emtpy :/</Text>
              </Flex>
            }
            keyExtractor={(item, i) =>
              String(item.publishedAt) + "-" + String(i)
            }
            renderItem={renderItem}
            contentContainerStyle={{
              paddingBottom: 44,
              paddingTop: 10,
            }}
            estimatedItemSize={68}
          />
        )}
        <EpisodeSearchModalFooter
          podcastFeedEpisodes={podcastFeedEpisodes || []}
        />
      </Screen>
    </AppBottomSheetModal>
  );
};

const EpisodeSearchModalFooter = ({
  podcastFeedEpisodes,
}: {
  podcastFeedEpisodes: PodcastFeedEpisode[];
}) => {
  const setPodcastEpisodeSearchModal = useSetAtom(
    podcastEpisodeSearchModalAtom
  );
  const podcastFeedEpisodesSelected = useAtomValue(
    podcastFeedEpisodesSelectedAtom
  );
  const requestInfo = useAtomValue(requestInfoAtom);
  const { bottom } = useAppSafeAreas();

  const pathname = usePathname();
  const libraryItemId = pathname.split("/").pop();

  const selectedEpisodes = Object.keys(podcastFeedEpisodesSelected).filter(
    (key) => !!podcastFeedEpisodesSelected[key]
  );

  const length = selectedEpisodes.length;

  const addEpisodes = async () => {
    try {
      const episodesToDownload = selectedEpisodes.map(
        (key) => podcastFeedEpisodes[Number(key)]
      );

      await axios.post(
        `${requestInfo.serverAddress}/api/podcasts/${libraryItemId}/download-episodes`,
        episodesToDownload,
        { headers: { Authorization: `Bearer ${requestInfo.token}` } }
      );
    } catch (error) {
      console.log("[PODCAST_EPISODE_SEARCH_MODAL] addEpisodes error", error);
    } finally {
      setPodcastEpisodeSearchModal({ open: false });
    }
  };

  return (
    <Flex px="$4" pt="$2" bg="$background" pb={bottom}>
      <Button
        disabled={!length}
        opacity={!length ? 0.6 : 1}
        onPress={addEpisodes}
      >
        <Text>
          {!length
            ? "No Episodes Selected"
            : length === 1
            ? "Add 1 Episode to Server"
            : `Add ${length} Episodes to Server`}
        </Text>
      </Button>
    </Flex>
  );
};

const PodcastEpisodeSearchItem = ({
  item,
  index,
}: {
  item: PodcastFeedEpisode;
  index: number;
}) => {
  const [podcastFeedEpisodesSelected, setPodcastFeedEpisodesSelected] = useAtom(
    podcastFeedEpisodesSelectedAtom
  );

  const podcastFeedItemEpisodesDownloaded = useAtomValue(
    podcastFeedItemEpisodesDownloadedAtom
  );

  const isSelected = podcastFeedEpisodesSelected[String(index)];
  const isDownloaded = podcastFeedItemEpisodesDownloaded[item.enclosure.url];

  return (
    <TouchableArea
      flexDirection="row"
      alignItems="center"
      gap="$4"
      onPress={() => {
        if (isDownloaded) return;
        setPodcastFeedEpisodesSelected((prev) => {
          const key = String(index);
          return { ...prev, [key]: !prev[key] };
        });
      }}
      opacity={isDownloaded ? 0.7 : 1}
      disabled={isDownloaded}
    >
      <Flex
        zIndex={100}
        centered
        borderWidth={1}
        padding
        borderRadius={100}
        borderColor={"$gray10"}
      >
        {isSelected ? (
          <Dot bg="$blue9" h={9} w={9} />
        ) : (
          <Dot bg={isDownloaded ? "$red10" : "transparent"} h={9} w={9} />
        )}
      </Flex>
      <Flex space="$1.5">
        {item.episode ? <Text numberOfLines={1}>#{item.episode}</Text> : null}
        <Text numberOfLines={1} fontWeight={"700"}>
          {item.title}
        </Text>
        <Text numberOfLines={1} fontSize={14} color={"$gray11"}>
          {item.subtitle}
        </Text>

        <Text numberOfLines={1} fontSize={10} color={"$gray11"}>
          {dateDistanceFromNow(item.publishedAt)}
        </Text>
      </Flex>
    </TouchableArea>
  );
};
