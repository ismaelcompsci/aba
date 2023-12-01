import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Text } from "tamagui";

import { RecentEpisodesResponse } from "../../types/types";
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

  let flattenData =
    data?.pages.flatMap((page) => page?.data.episodes || []) || [];

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Screen>
      <Flex fill px="$4" pt="$2">
        <Flex fill>
          <FlashList
            ListHeaderComponent={() => (
              <Text fontWeight="800" fontSize={24}>
                Latest Episodes
              </Text>
            )}
            showsVerticalScrollIndicator={false}
            data={flattenData}
            keyExtractor={(item) => item.id}
            onEndReached={loadNextPageData}
            renderItem={({ item }) => (
              <EpisodeTableRow item={item} podcastId={item.libraryItemId} />
            )}
            estimatedItemSize={149}
          />
        </Flex>
      </Flex>
    </Screen>
  );
};

export default LatestPage;
