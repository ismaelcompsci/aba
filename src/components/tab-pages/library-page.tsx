import { memo, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { Button, Spinner, Text } from "tamagui";

import { IS_ANDROID, LIBRARY_INFINITE_LIMIT } from "../../constants/consts";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { changingLibraryAtom } from "../../state/app-state";
import { descOrderAtom, sortAtom } from "../../state/local-state";
import { LibraryItemMinified } from "../../types/aba";
import { LibraryItems } from "../../types/types";
import BookCard from "../cards/book-card";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { Loaders } from "../loader";
import { SortSelect } from "../sort-popover";

interface LibraryPageProps {
  currentLibraryId?: string | null;
  serverAddress: string;
  filter?: string;
  userToken: string;
  isCoverSquareAspectRatio: boolean;
}

const LibraryPage = ({
  serverAddress,
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
    numOfColumns = 8;
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
      serverAddress,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        if (!serverAddress) return { data: { results: [], page: 0, total: 0 } };

        const d = descOrder ? 1 : 0;
        const { data }: { data: LibraryItems } = await axios.get(
          `${serverAddress}/api/libraries/${currentLibraryId}/items`,
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
      const page = Math.ceil(
        (lastPage.data?.total ?? -1) / LIBRARY_INFINITE_LIMIT
      );

      if (!lastPage?.data) return;
      if (lastPage?.data.page >= page) {
        return false;
      }

      return lastPage?.nextPage;
    },
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
        serverAddress={serverAddress}
        isCoverSquareAspectRatio={isCoverSquareAspectRatio}
        token={userToken}
        item={item}
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
    <Screen edges={["left", "right"]}>
      <Flex
        row
        centered
        justifyContent="space-between"
        px="$2"
        bg="$backgroundHover"
        $theme-oled={{
          backgroundColor: "rgb(14, 14, 14)",
        }}
        shadowColor={"$shadowColor"}
        shadowOffset={{ height: 2, width: 0 }}
        shadowOpacity={0.25}
        shadowRadius={6}
        width={"100%"}
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
      {isInitialLoading || changingLibrary || isEmpty ? (
        <Screen centered headerAndTabBar>
          {isEmpty ? <Text>Empty :/</Text> : <Loaders.Main />}
        </Screen>
      ) : (
        <Flex fill>
          <FlashList
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={flattenData || []}
            numColumns={columns}
            contentInset={{ top: 20 }}
            onEndReached={loadNextPageData}
            keyExtractor={(item) => `${item.id}}`}
            renderItem={handleRenderItem}
            scrollEventThrottle={16}
            estimatedItemSize={211}
            contentContainerStyle={
              IS_ANDROID
                ? {
                    paddingTop: 20,
                    paddingBottom: bottom,
                  }
                : { paddingBottom: bottom }
            }
            ListFooterComponent={
              hasNextPage ? (
                <Button mt="$3">
                  <Spinner />
                </Button>
              ) : null
            }
          />
        </Flex>
      )}
    </Screen>
  );
};

export default memo(LibraryPage);
