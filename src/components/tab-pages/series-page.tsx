import { memo, useCallback } from "react";
import { useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Separator, Text } from "tamagui";

import { SERIES_INFINITE_LIMIT } from "../../constants/consts";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { SeriesBooksMinified } from "../../types/aba";
import { LibrarySeries } from "../../types/types";
import SeriesCard from "../cards/series-card";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { Loaders } from "../loader";

interface SeriesPageProps {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
  isCoverSquareAspectRatio: boolean;
}

const SeriesPage = ({
  currentLibraryId,
  serverAddress,
  userToken,
  isCoverSquareAspectRatio,
}: SeriesPageProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const { bottom, headerHeight } = useAppSafeAreas();

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;

  // todo
  let columns = Math.floor(screenWidth / (bookWidth * 2)) - 1;
  columns = columns === 0 ? 1 : columns;

  const {
    data: seriesItems,
    isInitialLoading,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["library-series", currentLibraryId, userToken, serverAddress],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        if (!serverAddress) return { data: { results: [], page: 0, total: 0 } };
        const { data }: { data: LibrarySeries } = await axios.get(
          `${serverAddress}/api/libraries/${currentLibraryId}/series`,
          {
            params: {
              limit: SERIES_INFINITE_LIMIT,
              page: pageParam,
              minified: 1,
              include: "rssfeed,numEpisodesIncomplete",
            },
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        return { data, nextPage: pageParam + 1 };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error);
        }
        console.log({ error, SERIES: "ERROR" });

        return {};
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data) {
        return undefined;
      }

      if (lastPage?.data?.page >= lastPage?.data?.total) {
        return undefined;
      }

      return lastPage?.nextPage;
    },
    staleTime: 1000 * 60 * 60, // 1 hour in future use server events to invalidate data
  });

  const flattenData = seriesItems?.pages.flatMap(
    (page) => page?.data?.results || []
  );
  const isEmpty = flattenData?.length === 0 && !isLoading;

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRenderItem = useCallback(
    ({ item }: { item: SeriesBooksMinified }) => {
      return (
        <Flex grow centered>
          <SeriesCard
            userToken={userToken}
            item={item}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            serverAddress={serverAddress}
          />
        </Flex>
      );
    },
    [currentLibraryId]
  );

  const showLoadingOrEmpty = isInitialLoading || isLoading || isEmpty;

  return (
    <Screen
      headerAndTabBar={showLoadingOrEmpty ? true : false}
      edges={["left", "right"]}
    >
      {showLoadingOrEmpty ? (
        <Flex fill centered pb={headerHeight}>
          {isEmpty ? <Text>EMPTY</Text> : <Loaders.Main />}
        </Flex>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          horizontal={false}
          data={flattenData}
          numColumns={columns}
          onEndReached={loadNextPageData}
          keyExtractor={(item) => `${item.id}}`}
          renderItem={handleRenderItem}
          ItemSeparatorComponent={() => <Separator w={0} h={10} />}
          estimatedItemSize={bookWidth * 2}
          contentInset={{ top: 20 }}
          contentContainerStyle={{ paddingBottom: bottom }}
          ListEmptyComponent={() => {
            return <Text>EMPTY</Text>;
          }}
        />
      )}
    </Screen>
  );
};

export default memo(SeriesPage);
