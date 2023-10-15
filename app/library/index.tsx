import { Separator, Spinner, Text, XStack, YStack } from "tamagui";
import SectionHeader from "../../components/section-header";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getLibraryItems } from "../../api/library";
import {
  currentLibraryIdAtom,
  currentServerConfigAtom,
} from "../../utils/local-atoms";
import { useAtomValue } from "jotai/react";
import { FlashList } from "@shopify/flash-list";
import BookCard from "../../components/book/book-card";
import { useCallback, useEffect } from "react";
import { LibraryItemMinified } from "../../types/adbs";
import { Dimensions } from "react-native";
import { currentLibraryAtom } from "../../utils/atoms";
import { router } from "expo-router";
/**
 *
 *  https://levelup.gitconnected.com/react-native-infinite-scrolling-with-react-query-3c2cc69790be
 */
const LibraryPage = () => {
  const queryClient = useQueryClient();

  const libraryId = useAtomValue(currentLibraryIdAtom);
  const currentServerConfig = useAtomValue(currentServerConfigAtom);
  const lib = useAtomValue(currentLibraryAtom);

  const isCoverSquareAspectRatio = lib?.settings.coverAspectRatio === 1;

  const screenWidth = Dimensions.get("window").width;

  let numOfColumns;
  if (screenWidth <= 479) {
    numOfColumns = 3;
  } else if (screenWidth <= 767) {
    numOfColumns = 4;
  } else if (screenWidth <= 991) {
    numOfColumns = 5;
  } else {
    numOfColumns = 9;
  }

  const bookW = screenWidth / numOfColumns;
  const bookWidth = isCoverSquareAspectRatio ? bookW * 1.6 : bookW;
  let columns = Math.floor(screenWidth / bookWidth);
  columns = columns === 0 ? 1 : columns;

  /**in futire add invalidator for stale data using server socket form audiobookshelf when new item is added */
  const { data, isInitialLoading, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["library-items", `${libraryId}`],
      queryFn: ({ pageParam = 0 }) =>
        getLibraryItems({ pageParam, libraryId, limit: 20 }),
      getNextPageParam: (lastPage) => {
        if (lastPage.data.page >= lastPage.data.total) {
          return undefined;
        }

        return lastPage.nextPage;
      },
      staleTime: 1000 * 60 * 60,
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
    queryClient.invalidateQueries(["library-items"]);
  }, [lib]);

  const handleRenderItem = useCallback(
    ({ item, index }: { item: LibraryItemMinified; index: number }) => {
      return (
        <XStack
          justifyContent="center"
          alignItems="center"
          w={"100%"}
          p={0}
          m={0}
        >
          <BookCard
            currentServerConfig={currentServerConfig}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            token={currentServerConfig.token}
            item={item}
          />
        </XStack>
      );
    },
    [lib, isCoverSquareAspectRatio, screenWidth, flattenData]
  );

  return (
    <>
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

export default LibraryPage;
