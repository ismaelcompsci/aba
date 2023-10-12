import { Separator, Spinner, Text, XStack, YStack } from "tamagui";
import SectionHeader from "../../components/section-header";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getLibraryItems } from "../../api/library";
import {
  currentLibraryIdAtom,
  currentServerConfigAtom,
} from "../../utils/local-atoms";
import { useAtomValue } from "jotai/react";
import { FlashList } from "@shopify/flash-list";
import BookCard from "../../components/book/book-card";
import { useCallback } from "react";
import { LibraryItemMinified } from "../../types/adbs";
/**
 *
 *  https://levelup.gitconnected.com/react-native-infinite-scrolling-with-react-query-3c2cc69790be
 */
const LibraryPage = () => {
  const libraryId = useAtomValue(currentLibraryIdAtom);
  const currentServerConfig = useAtomValue(currentServerConfigAtom);

  /**in futire add invalidator for stale data using server socket form audiobookshelf when new item is added */
  const { data, isInitialLoading, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
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

  const handleRenderItem = useCallback(
    ({ item }: { item: LibraryItemMinified }) => {
      return (
        <BookCard
          currentServerConfig={currentServerConfig}
          isCoverSquareAspectRatio={false}
          token={currentServerConfig.token}
          item={item}
        />
      );
    },
    [flattenData]
  );

  return (
    <>
      <SectionHeader />
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
          pb={"$10"}
          pl={"$4"}
        >
          <FlashList
            ItemSeparatorComponent={() => {
              return <Separator vertical={false} w={100} h={10} />;
            }}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={flattenData}
            numColumns={3}
            onEndReached={loadNextPageData}
            keyExtractor={(item, i) => `${i}${item.id}`}
            renderItem={handleRenderItem}
            estimatedItemSize={196}
          />
        </XStack>
      )}
    </>
  );
};

export default LibraryPage;
