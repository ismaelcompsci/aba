import { useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Image, Separator, Spinner, Text } from "tamagui";

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
}: LatestPageProps) => {
  const { data, isInitialLoading, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
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

  const Item = ({ item }: { item: PodcastEpisodeWithPodcast }) => {
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
    <Screen edges={["left", "right"]}>
      <Flex fill px="$4" pt="$2">
        {isInitialLoading ? (
          <Flex width="100%">
            <Spinner />
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
              keyExtractor={(item) => item.id}
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
/**
 *           <Button
            theme={"blue"}
            borderRadius={"$4"}
            padding="$3"
            width="100%"
            pressTheme={false}
            focusTheme={false}
            hoverTheme={false}
            pressStyle={{
              bg: "",
            }}
          >
            <Spinner />
            <Text>Loading</Text>
          </Button>
 */

export default LatestPage;
