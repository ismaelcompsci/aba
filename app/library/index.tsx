import { Spinner, Text, XStack, YStack } from "tamagui";
import SectionHeader from "../../components/section-header";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getLibraryItems } from "../../api/library";
import { currentLibraryIdAtom } from "../../utils/local-atoms";
import { useAtomValue } from "jotai/react";
import { FlashList } from "@shopify/flash-list";

/**
 *
 *  https://levelup.gitconnected.com/react-native-infinite-scrolling-with-react-query-3c2cc69790be
 */
const LibraryPage = () => {
  const libraryId = useAtomValue(currentLibraryIdAtom);

  /**in futire add invalidator for stale data using server socket form audiobookshelf when new item is added */
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["library-items"],
    queryFn: ({ pageParam = 0 }) =>
      getLibraryItems({ pageParam, libraryId, limit: 20 }),
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
        px={"$2"}
        justifyContent="center"
        alignItems="center"
        pb={"$10"}
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
                    <Text fontSize={"$10"}>{item.media.metadata.title}</Text>
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

export default LibraryPage;
