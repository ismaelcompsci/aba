import { Text, XStack, YStack } from "tamagui";
import SectionHeader from "../../components/section-header";
import { useAtomValue } from "jotai/react";
import { currentLibraryIdAtom } from "../../utils/local-atoms";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getLibrarySeries } from "../../api/library";
import { FlashList } from "@shopify/flash-list";

const SeriesPages = () => {
  const libraryId = useAtomValue(currentLibraryIdAtom);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
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
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={flattenData}
            onEndReached={loadNextPageData}
            keyExtractor={(item, i) => `${i}${item.id}`}
            renderItem={({ item }) => {
              return (
                <XStack w={"100%"} h={"$6"}>
                  <YStack>
                    <Text fontSize={"$10"}>{item.nameIgnorePrefix}</Text>
                  </YStack>
                </XStack>
              );
            }}
            estimatedItemSize={200}
          />
        </XStack>
      </YStack>
    </>
  );
};

export default SeriesPages;
