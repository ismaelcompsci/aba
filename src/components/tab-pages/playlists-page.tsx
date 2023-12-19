import { useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Separator, Text } from "tamagui";

import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { PlaylistExpanded } from "../../types/aba";
import { LibraryPlaylistsResponse } from "../../types/types";
import { PlaylistsCard } from "../cards/playlists-card";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { Loaders } from "../loader";

interface PlaylistsPageProps {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
}

const PlaylistsPage = ({
  currentLibraryId,
  serverAddress,
  userToken,
}: PlaylistsPageProps) => {
  const { width: screenWidth } = useWindowDimensions();
  const { bottom } = useAppSafeAreas();

  const bookWidth = 100 * 1.6;
  let columns = Math.floor(screenWidth / bookWidth);
  const canFitTwo = columns === 2;
  columns = columns === 0 ? 1 : canFitTwo ? columns : columns - 1;

  const { data, isLoading } = useQuery({
    queryKey: ["playlists-page", currentLibraryId],
    queryFn: async () => {
      try {
        const response: { data: LibraryPlaylistsResponse } = await axios.get(
          `${serverAddress}/api/libraries/${currentLibraryId}/playlists`,
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        console.log("[PLAYLISTS_PAGE] error ", error);
      }
    },
  });

  const handleRenderItem = ({ item }: { item: PlaylistExpanded }) => {
    return (
      <Flex grow centered>
        <PlaylistsCard
          item={item}
          userToken={userToken}
          serverAddress={serverAddress}
        />
      </Flex>
    );
  };

  return (
    <Screen edges={["left", "right"]}>
      {isLoading ? (
        <Flex fill centered>
          <Loaders.Main />
        </Flex>
      ) : (
        <FlashList
          showsVerticalScrollIndicator={false}
          horizontal={false}
          data={data?.results || []}
          numColumns={columns}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          renderItem={handleRenderItem}
          ItemSeparatorComponent={() => <Separator w={0} h={10} />}
          estimatedItemSize={171}
          contentContainerStyle={{ paddingBottom: bottom }}
          ListEmptyComponent={() => {
            return (
              <Flex fill centered>
                <Text>Empty :/</Text>
              </Flex>
            );
          }}
        />
      )}
    </Screen>
  );
};

export default PlaylistsPage;
