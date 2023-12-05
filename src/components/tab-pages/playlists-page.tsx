import { useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Separator, Spinner, Text } from "tamagui";

import { LIBRARY_INFINITE_LIMIT } from "../../constants/consts";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { PlaylistExpanded } from "../../types/aba";
import { PlaylistsCard } from "../cards/playlists-card";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";

interface PlaylistsPageProps {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
  isCoverSquareAspectRatio: boolean;
}

type LibraryPlaylistsResposne = {
  total: number;
  page: number;
  limit: number;
  results: PlaylistExpanded[];
};

const PlaylistsPage = ({
  currentLibraryId,
  isCoverSquareAspectRatio,
  serverAddress,
  userToken,
}: PlaylistsPageProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const { bottom } = useAppSafeAreas();

  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  let columns = Math.floor(screenWidth / bookWidth);
  const canFitTwo = columns === 2;
  columns = columns === 0 ? 1 : canFitTwo ? columns : columns - 1;

  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["playlists", currentLibraryId],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response: { data: LibraryPlaylistsResposne } = await axios.get(
          `${serverAddress}/api/libraries/${currentLibraryId}/playlists`,
          {
            params: {
              limit: LIBRARY_INFINITE_LIMIT,
              page: pageParam,
            },
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        return { data: response.data, nextPage: pageParam + 1 };
      } catch (error) {
        console.log("[PLAYLISTS_PAGE] error ", error);
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data) return;
      if (lastPage?.data.page >= lastPage?.data.total) {
        return undefined;
      }

      return lastPage?.nextPage;
    },
  });

  const flattenData =
    data?.pages.flatMap((page) => page?.data?.results || []) || [];

  const loadNextPageData = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRenderItem = ({ item }: { item: PlaylistExpanded }) => {
    return (
      <Flex grow centered>
        <PlaylistsCard
          item={item}
          userToken={userToken}
          serverAddress={serverAddress}
          isCoverSquareAspectRatio={isCoverSquareAspectRatio}
        />
      </Flex>
    );
  };

  console.log({ isLoading, flattenData });
  return (
    <Screen>
      {isLoading ? (
        <Flex fill centered>
          <Spinner />
        </Flex>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          horizontal={false}
          data={flattenData}
          numColumns={columns}
          onEndReached={loadNextPageData}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          renderItem={handleRenderItem}
          ItemSeparatorComponent={() => <Separator w={0} h={10} />}
          estimatedItemSize={171}
          contentContainerStyle={{ paddingBottom: bottom }}
          ListEmptyComponent={() => {
            return <Text>EMPTY</Text>;
          }}
        />
      )}
    </Screen>
  );
};

export default PlaylistsPage;
