import { useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Separator, Text } from "tamagui";

import {
  PodcastEpisodeWithPodcast,
  RecentEpisodesResponse,
} from "../../types/types";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { Loaders } from "../loader";
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
}: LatestPageProps) => {
  const { data, isInitialLoading, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["latest-episodes", currentLibraryId, serverAddress, userToken],
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
    [data]
  );

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const Item = ({ item }: { item: PodcastEpisodeWithPodcast }) => {
    const cover = `${serverAddress}/api/items/${item.libraryItemId}/cover?token=${userToken}`;

    return (
      <EpisodeTableRow
        item={item}
        podcastId={item.libraryItemId}
        cover={cover}
        numberOfLines={1}
      />
    );
  };

  return (
    <Screen edges={["left", "right"]}>
      <Flex fill px="$4" pt="$2">
        {isInitialLoading ? (
          <Flex width="100%">
            <Loaders.Main />
          </Flex>
        ) : (
          <Flex fill>
            <FlashList
              ListEmptyComponent={() =>
                !isInitialLoading && (
                  <Flex fill centered>
                    <Text>Empty :/</Text>
                  </Flex>
                )
              }
              ListHeaderComponent={() => (
                <Text fontWeight="800" fontSize={24} pb="$2">
                  Latest Episodes
                </Text>
              )}
              showsVerticalScrollIndicator={false}
              data={flattenData}
              // eslint-disable-next-line react/prop-types
              keyExtractor={(item) => item.id + "latest-page"}
              ItemSeparatorComponent={() => (
                <Separator width="95%" alignSelf="center" my="$2" />
              )}
              onEndReached={loadNextPageData}
              renderItem={Item}
              contentContainerStyle={{
                paddingBottom: 40,
              }}
              estimatedItemSize={149}
            />
          </Flex>
        )}
      </Flex>
    </Screen>
  );
};

export default LatestPage;
