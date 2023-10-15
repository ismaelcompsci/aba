import { Separator, Spinner, XStack, YStack } from "tamagui";
import { useAtomValue } from "jotai/react";
import { currentLibraryIdAtom } from "../../utils/local-atoms";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getLibrarySeries } from "../../api/library";
import { FlashList } from "@shopify/flash-list";
import { SeriesBooksMinified } from "../../types/adbs";

import SeriesCard from "../../components/series/series-card";
import { currentLibraryAtom } from "../../utils/atoms";
import { Dimensions } from "react-native";
import { useCallback, useEffect } from "react";

const SeriesPages = () => {
  const queryClient = useQueryClient();

  const libraryId = useAtomValue(currentLibraryIdAtom);
  const lib = useAtomValue(currentLibraryAtom);

  const isCoverSquareAspectRatio = lib?.settings.coverAspectRatio === 1;

  const screenWidth = Dimensions.get("window").width;
  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;

  let columns = Math.floor(screenWidth / (bookWidth * 2)) - 1;
  columns = columns === 0 ? 1 : columns;

  const { data, fetchNextPage, hasNextPage, isInitialLoading } =
    useInfiniteQuery({
      queryKey: ["library-series", `${libraryId}`],
      queryFn: ({ pageParam = 0 }) =>
        getLibrarySeries({ pageParam, libraryId, limit: 20 }),
      getNextPageParam: (lastPage) => {
        if (lastPage.data.page >= lastPage.data.total) {
          return undefined;
        }

        return lastPage.nextPage;
      },
      staleTime: 1000 * 60 * 60, // 1 hour in future use server events to invalidate data
      refetchOnMount: true,
    });

  let flattenData = data?.pages.flatMap((page) => page.data.results);

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    flattenData = [];
    queryClient.invalidateQueries(["library-series"]);
  }, [lib]);

  const handleRenderItem = useCallback(
    ({ item }: { item: SeriesBooksMinified }) => {
      return (
        <SeriesCard
          screenWidth={screenWidth}
          item={item}
          isCoverSquareAspectRatio={isCoverSquareAspectRatio}
        />
      );
    },
    [lib, isCoverSquareAspectRatio, screenWidth, flattenData]
  );

  return (
    <>
      {/* <SectionHeader /> */}
      {isInitialLoading ? (
        <XStack
          bg={"$background"}
          w={"100%"}
          h={"100%"}
          justifyContent="center"
          alignItems="center"
        >
          <Spinner />
        </XStack>
      ) : (
        <XStack
          bg={"$background"}
          w={"100%"}
          h={"100%"}
          justifyContent="center"
          alignItems="center"
        >
          <FlashList
            ListHeaderComponentStyle={{
              paddingBottom: 10,
            }}
            ItemSeparatorComponent={() => <Separator w={0} h={"$1"} />}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={flattenData}
            numColumns={columns}
            onEndReached={loadNextPageData}
            keyExtractor={(item, i) => `${item.id}}`}
            renderItem={handleRenderItem}
            estimatedItemSize={184}
          />
        </XStack>
      )}
    </>
  );
};

export default SeriesPages;
