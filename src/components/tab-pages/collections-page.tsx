import { useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Separator, Spinner, Text } from "tamagui";

import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { CollectionMinified } from "../../types/aba";
import { LibraryCollections } from "../../types/types";
import SeriesCard from "../cards/series-card";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";

interface CollectionsPageProps {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
}

const CollectionsPage = ({
  currentLibraryId,
  serverAddress,
  userToken,
}: CollectionsPageProps) => {
  const { headerHeight } = useAppSafeAreas();
  const { width: screenWidth } = useWindowDimensions();

  const bookWidth = 100;
  // todo
  let columns = Math.floor(screenWidth / (bookWidth * 2)) - 1;
  columns = columns === 0 ? 1 : columns;

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections-page", currentLibraryId],
    queryFn: async () => {
      try {
        const response: { data: LibraryCollections } = await axios.get(
          `${serverAddress}/api/libraries/${currentLibraryId}/collections`,
          {
            params: {
              minified: 1,
              include: "rssfeed,numEpisodesIncomplete",
            },
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        console.log("[COLLECTIONS_PAGE] error ", error);
      }
    },
  });

  const handleRenderItem = ({ item }: { item: CollectionMinified }) => {
    return (
      <Flex grow centered>
        <SeriesCard
          item={item}
          isCoverSquareAspectRatio={false}
          serverAddress={serverAddress}
          userToken={userToken}
          isCollection
        />
      </Flex>
    );
  };

  return (
    <Screen edges={["left", "right"]}>
      {isLoading ? (
        <Flex fill centered pb={headerHeight}>
          <Spinner />
        </Flex>
      ) : (
        <Flex fill>
          <FlashList
            showsVerticalScrollIndicator={false}
            horizontal={false}
            data={collections?.results ?? []}
            numColumns={columns}
            keyExtractor={(item) => `${item.id}}`}
            ItemSeparatorComponent={() => <Separator w={0} h={10} />}
            estimatedItemSize={150}
            renderItem={handleRenderItem}
            ListEmptyComponent={
              <Flex p="$4" centered>
                <Text>Empty :/</Text>
              </Flex>
            }
          />
        </Flex>
      )}
    </Screen>
  );
};

export default CollectionsPage;
