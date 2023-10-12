import { XStack, YStack } from "tamagui";
import SectionHeader from "../../components/section-header";
import { useAtomValue } from "jotai/react";
import { currentLibraryIdAtom } from "../../utils/local-atoms";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getLibrarySeries } from "../../api/library";
import { FlashList } from "@shopify/flash-list";
import { SeriesBooksMinified } from "../../types/adbs";

import SeriesCard from "../../components/series/series-card";
import { currentLibraryAtom } from "../../utils/atoms";
import { Dimensions } from "react-native";

const SeriesPages = () => {
  const libraryId = useAtomValue(currentLibraryIdAtom);
  const lib = useAtomValue(currentLibraryAtom);
  const screenWidth = Dimensions.get("screen").width;

  const isCoverSquareAspectRatio = lib?.settings.coverAspectRatio === 1;

  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["library-series"],
    queryFn: ({ pageParam = 0 }) =>
      getLibrarySeries({ pageParam, libraryId, limit: 20 }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.page >= lastPage.data.total) {
        return undefined;
      }

      return lastPage.nextPage;
    },
    staleTime: 1000 * 60 * 60,
  });

  const flattenData = data?.pages.flatMap((page) => page.data.results);

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRenderItem = ({ item }: { item: SeriesBooksMinified }) => {
    return (
      <SeriesCard
        screenWidth={screenWidth}
        item={item}
        isCoverSquareAspectRatio={isCoverSquareAspectRatio}
      />
    );
  };

  return (
    <>
      <SectionHeader />
      <YStack
        bg={"$background"}
        h={"100%"}
        w={"100%"}
        justifyContent="center"
        alignItems="center"
        pb={"$10"}
        px={"$2"}
      >
        <XStack height={"100%"}>
          <FlashList
            numColumns={2}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={flattenData}
            onEndReached={loadNextPageData}
            keyExtractor={(item, i) => `${i}${item.id}`}
            renderItem={handleRenderItem}
            estimatedItemSize={200}
          />
        </XStack>
      </YStack>
    </>
  );
};

export default SeriesPages;
