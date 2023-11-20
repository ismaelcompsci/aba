import { memo, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { Spinner, Text } from "tamagui";

import { LIBRARY_INFINITE_LIMIT } from "../../constants/consts";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { changingLibraryAtom } from "../../state/app-state";
import { descOrderAtom, sortAtom } from "../../state/local-state";
import { LibraryItemMinified } from "../../types/aba";
import { LibraryItems, ServerConfig } from "../../types/types";
import BookCard from "../cards/book-card";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { SortSelect } from "../sort-popover";

interface LibraryPageProps {
  currentLibraryId?: string | null;
  serverConfig: ServerConfig | null;
  filter?: string;
  userToken: string;
  isCoverSquareAspectRatio: boolean;
}

const LibraryPage = ({
  serverConfig,
  currentLibraryId,
  filter,
  userToken,
  isCoverSquareAspectRatio,
}: LibraryPageProps) => {
  const sort = useAtomValue(sortAtom);
  const descOrder = useAtomValue(descOrderAtom);
  const [changingLibrary] = useAtom(changingLibraryAtom);

  const queryClient = useQueryClient();

  const { width: screenWidth } = useWindowDimensions();
  const { bottom } = useAppSafeAreas();

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
    queryKey: [
      "library-items",
      currentLibraryId,
      sort,
      `${descOrder}`,
      filter ? filter : null,
      serverConfig?.id,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        if (!serverConfig?.id)
          return { data: { results: [], page: 0, total: 0 } };

        const d = descOrder ? 1 : 0;
        const { data }: { data: LibraryItems } = await axios.get(
          `${serverConfig?.serverAddress}/api/libraries/${currentLibraryId}/items`,
          {
            params: {
              limit: LIBRARY_INFINITE_LIMIT,
              page: pageParam,
              minified: 1,
              include: "rssfeed,numEpisodesIncomplete",
              sort: sort,
              desc: d,
              filter: filter,
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
        console.log({ error, LIBRARY: "ERROR" });
      }
      return {};
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data) return;
      if (lastPage?.data.page >= lastPage?.data.total) {
        return undefined;
      }

      return lastPage?.nextPage;
    },
    staleTime: 1000 * 60 * 60,
    refetchOnMount: true,
  });

  let flattenData =
    libraryItems?.pages.flatMap((page) => page?.data?.results || []) || [];

  const isEmpty = flattenData?.length === 0 && !isLoading;

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRenderItem = ({
    item,
  }: {
    item: LibraryItemMinified;
    index: number;
  }) => {
    return (
      <BookCard
        serverConfig={serverConfig}
        isCoverSquareAspectRatio={isCoverSquareAspectRatio}
        token={userToken}
        item={item}
        grow
        centered
        p="$2"
      />
    );
  };

  useEffect(() => {
    resetQuery();
  }, [currentLibraryId, descOrder]);

  const resetQuery = () => {
    flattenData = [];
    queryClient.invalidateQueries(["library-items"]);
    queryClient.resetQueries({ queryKey: ["library-items"] });
  };

  const seriesName =
    flattenData.length && "series" in flattenData[0].media.metadata
      ? // @ts-ignore todo
        flattenData?.[0].media.metadata.series?.name
      : null;

  return (
    <Screen>
      <Flex
        row
        centered
        justifyContent="space-between"
        px="$2"
        bg="$backgroundHover"
        shadowColor={"$backgroundStrong"}
        shadowOffset={{ height: 2, width: 0 }}
        shadowOpacity={0.25}
        shadowRadius={6}
      >
        <Text fontWeight="$8">{libraryItems?.pages[0]?.data?.total} Books</Text>
        {filter && seriesName ? (
          <Text numberOfLines={1} maxWidth={screenWidth / 1.6}>
            {seriesName}
          </Text>
        ) : null}
        <SortSelect placement="bottom-end" />
      </Flex>
      {/* items */}
      {isInitialLoading || isLoading || changingLibrary || isEmpty ? (
        <Screen centered headerAndTabBar>
          {isEmpty ? <Text>EMPTY</Text> : <Spinner />}
        </Screen>
      ) : (
        <Flex fill>
          <FlashList
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={flattenData || []}
            numColumns={columns}
            onEndReached={loadNextPageData}
            keyExtractor={(item) => `${item.id}}`}
            renderItem={handleRenderItem}
            estimatedItemSize={bookWidth}
            contentContainerStyle={{ paddingBottom: bottom }}
          />
        </Flex>
      )}
    </Screen>
  );
};

export default memo(LibraryPage);
