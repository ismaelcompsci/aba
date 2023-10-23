import { useCallback, useEffect } from "react";
import { Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { Spinner, Text, XStack, YStack } from "tamagui";

import { LIBRARY_INFINITE_LIMIT } from "../../constants/consts";
import useIconTheme from "../../hooks/use-icon-theme";
import { changingLibraryAtom } from "../../state/app-state";
import { descOrderAtom, sortAtom } from "../../state/local-state";
import { Library, LibraryItemMinified, User } from "../../types/aba";
import { LibraryItems, ServerConfig } from "../../types/types";
import BookCard from "../cards/book-card";
import { ScreenCenterWithTabBar } from "../center";
import { SortSelect } from "../sort-popover";

import { PageView } from "./page-view";

interface LibraryPageProps {
  currentLibraryId?: string | null;
  serverConfig: ServerConfig | null;
  library: Library | null;
  user: User | null;
}

const LibraryPage = ({
  library,
  user,
  serverConfig,
  currentLibraryId,
}: LibraryPageProps) => {
  const sort = useAtomValue(sortAtom);
  const descOrder = useAtomValue(descOrderAtom);
  const [changingLibrary] = useAtom(changingLibraryAtom);

  const queryClient = useQueryClient();
  const { themeColor } = useIconTheme();
  const isCoverSquareAspectRatio = library?.settings.coverAspectRatio === 1;

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
  columns = columns === 0 || columns === 1 ? 2 : columns;

  const {
    data: libraryItems,
    hasNextPage,
    fetchNextPage,
    isInitialLoading,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["library-items", library?.id, sort, `${descOrder}`],
    queryFn: async ({ pageParam = 0 }) => {
      const d = descOrder ? 1 : 0;
      const { data }: { data: LibraryItems } = await axios.get(
        `${serverConfig?.serverAddress}/api/libraries/${library?.id}/items`,
        {
          params: {
            limit: LIBRARY_INFINITE_LIMIT,
            page: pageParam,
            minified: 1,
            include: "rssfeed,numEpisodesIncomplete",
            sort: sort,
            desc: d,
          },
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      return { data, nextPage: pageParam + 1 };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.page >= lastPage.data.total) {
        return undefined;
      }

      return lastPage.nextPage;
    },
    staleTime: 1000 * 60 * 60,
    refetchOnMount: true,
  });

  let flattenData = libraryItems?.pages.flatMap((page) => page.data.results);

  const isEmpty = flattenData?.length === 0 && !isLoading;

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRenderItem = useCallback(
    ({ item }: { item: LibraryItemMinified; index: number }) => {
      return (
        <XStack pt={"$3"}>
          <BookCard
            serverConfig={serverConfig}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            token={user?.token}
            item={item}
            w={"100%"}
          />
        </XStack>
      );
    },
    [currentLibraryId]
  );

  useEffect(() => {
    flattenData = [];
    queryClient.invalidateQueries(["library-items"]);
    queryClient.resetQueries({ queryKey: ["library-items"] });
  }, [library, currentLibraryId, descOrder]);

  return (
    <PageView>
      <YStack bg={"$background"} w={"100%"} h={"100%"}>
        {/* sort & filter */}
        <XStack
          w={"100%"}
          justifyContent="flex-end"
          alignItems="center"
          px="$2"
          bbw={2}
          bbc={themeColor}
        >
          <SortSelect placement="bottom-end" />
        </XStack>
        {/* items */}
        {isInitialLoading || isLoading || changingLibrary || isEmpty ? (
          <ScreenCenterWithTabBar>
            {isEmpty ? <Text>EMPTY</Text> : <Spinner />}
          </ScreenCenterWithTabBar>
        ) : (
          <FlashList
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={flattenData || []}
            numColumns={columns}
            onEndReached={loadNextPageData}
            keyExtractor={(item) => `${item.id}}`}
            renderItem={handleRenderItem}
            estimatedItemSize={bookWidth}
          />
        )}
      </YStack>
    </PageView>
  );
};

export default LibraryPage;
