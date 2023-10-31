import { useCallback } from "react";
import { Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Separator, Spinner, Text, XStack, YStack } from "tamagui";

import { SERIES_INFINITE_LIMIT } from "../../constants/consts";
import { Library, SeriesBooksMinified, User } from "../../types/aba";
import { LibrarySeries, ServerConfig } from "../../types/types";
import SeriesCard from "../cards/series-card";
import { FullScreen, ScreenCenterWithTabBar } from "../center";

import { PageView } from "./page-view";

interface SeriesPageProps {
  library: Library | null;
  currentLibraryId: string | null;
  user: User | null;
  serverConfig: ServerConfig | null;
}

const SeriesPage = ({
  library,
  currentLibraryId,
  user,
  serverConfig,
}: SeriesPageProps) => {
  const isCoverSquareAspectRatio = library?.settings.coverAspectRatio === 1;

  const screenWidth = Dimensions.get("window").width;
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
    queryKey: ["library-series", `${library?.id}`, user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const { data }: { data: LibrarySeries } = await axios.get(
          `${serverConfig?.serverAddress}/api/libraries/${library?.id}/series`,
          {
            params: {
              limit: SERIES_INFINITE_LIMIT,
              page: pageParam,
              minified: 1,
              include: "rssfeed,numEpisodesIncomplete",
            },
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );

        return { data, nextPage: pageParam + 1 };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error);
          // prettyLog(error);
        }
        console.log({ error, SERIES: "ERROR" });

        throw new Error();
      }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.data.page >= lastPage?.data.total) {
        return undefined;
      }

      return lastPage?.nextPage;
    },
    staleTime: 1000 * 60 * 60, // 1 hour in future use server events to invalidate data
    refetchOnMount: true,
  });

  const flattenData = seriesItems?.pages.flatMap((page) => page?.data?.results);
  const isEmpty = flattenData?.length === 0 && !isLoading;

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRenderItem = useCallback(
    ({ item }: { item: SeriesBooksMinified }) => {
      return (
        <XStack ai="center" jc="center" w="100%">
          <SeriesCard
            item={item}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            serverConfig={serverConfig}
          />
        </XStack>
      );
    },
    [currentLibraryId]
  );

  return (
    <PageView>
      <FullScreen>
        {isInitialLoading || isLoading || isEmpty ? (
          <ScreenCenterWithTabBar>
            {isEmpty ? <Text>EMPTY</Text> : <Spinner />}
          </ScreenCenterWithTabBar>
        ) : (
          <YStack w="100%" h="100%">
            <FlashList
              showsVerticalScrollIndicator={false}
              horizontal={false}
              data={flattenData || []}
              numColumns={columns}
              onEndReached={loadNextPageData}
              keyExtractor={(item) => `${item.id}}`}
              renderItem={handleRenderItem}
              ItemSeparatorComponent={() => <Separator w={0} h={10} />}
              estimatedItemSize={bookWidth}
              ListFooterComponent={() => <Separator w={0} h={30} />}
              ListEmptyComponent={() => {
                return <Text>EMPTY</Text>;
              }}
            />
          </YStack>
        )}
      </FullScreen>
    </PageView>
  );
};

export default SeriesPage;
