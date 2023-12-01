import { useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Image, Separator, Text } from "tamagui";

import {
  PodcastEpisodeWithPodcast,
  RecentEpisodesResponse,
} from "../../types/types";
import { dateDistanceFromNow } from "../../utils/utils";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import EpisodeTableRow from "../tables/episode-table-row";

interface LatestPageProps {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
  isCoverSquareAspectRatio: boolean;
}

const LatestPage = ({
  currentLibraryId,
  serverAddress,
  userToken,
  isCoverSquareAspectRatio,
}: LatestPageProps) => {
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["latest-episodes"],
    queryFn: async ({ pageParam = 0 }) => {
      const response: { data: RecentEpisodesResponse } = await axios.get(
        `${serverAddress}/api/libraries/${currentLibraryId}/recent-episodes`,
        {
          params: {
            limit: 25,
            page: pageParam,
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      return { data: response.data, nextPage: pageParam + 1 };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data) return;
      if (lastPage?.data.page >= lastPage?.data.total) {
        return undefined;
      }

      return lastPage?.nextPage;
    },
  });

  const flattenData = useMemo(
    () => data?.pages.flatMap((page) => page?.data.episodes || []) || [],
    [data?.pageParams]
  );

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const renderItem = ({ item }: { item: PodcastEpisodeWithPodcast }) => {
    const cover = `${serverAddress}/api/items/${item.libraryItemId}/cover?token=${userToken}`;
    return (
      <Flex>
        <Flex row>
          {cover ? (
            <Image
              width={"$5"}
              height={"$5"}
              resizeMode="cover"
              source={{
                uri: cover,
              }}
            />
          ) : null}
          <Flex px="$2">
            <Text fontSize={16}>{item.podcast.metadata.title}</Text>
            <Text color={"$gray10"}>
              {dateDistanceFromNow(item.publishedAt)}
            </Text>
          </Flex>
        </Flex>
        <EpisodeTableRow item={item} podcastId={item.libraryItemId} />
      </Flex>
    );
  };

  return (
    <Screen>
      <Flex fill px="$4" pt="$2">
        <Flex fill>
          <FlashList
            ListHeaderComponent={() => (
              <Text fontWeight="800" fontSize={24} pb="$2">
                Latest Episodes
              </Text>
            )}
            showsVerticalScrollIndicator={false}
            data={flattenData}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => (
              <Separator width="95%" alignSelf="center" my="$2" />
            )}
            onEndReached={loadNextPageData}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingBottom: 40,
            }}
            estimatedItemSize={149}
          />
        </Flex>
      </Flex>
    </Screen>
  );
};

export default LatestPage;
