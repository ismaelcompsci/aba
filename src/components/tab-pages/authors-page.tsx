import { useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Spinner, Text } from "tamagui";

import { AuthorExpanded } from "../../types/aba";
import AuthorCard from "../cards/author-card";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";

interface AuthorsPageProps {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
}

const AuthorsPage = ({
  currentLibraryId,
  serverAddress,
  userToken,
}: AuthorsPageProps) => {
  const width = 96;
  const height = 120;

  const { width: screenWidth } = useWindowDimensions();

  let columns = Math.floor(screenWidth / width) - 1;
  columns = columns < 1 ? 1 : columns;

  const { data, isLoading } = useQuery({
    queryKey: ["authors-page", [currentLibraryId]],
    queryFn: async () => {
      const response: { data: { authors: AuthorExpanded[] } } = await axios.get(
        `${serverAddress}/api/libraries/${currentLibraryId}/authors`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      return response.data.authors;
    },
  });

  const renderItem = ({ item }: { item: AuthorExpanded }) => {
    return (
      <Flex grow centered>
        <AuthorCard
          userToken={userToken}
          serverAddress={serverAddress}
          author={item}
          width={width}
          height={height}
        />
      </Flex>
    );
  };

  return (
    <Screen edges={["left", "right"]}>
      {isLoading || !data ? (
        <Flex fill centered>
          <Spinner />
        </Flex>
      ) : (
        <Flex fill>
          <FlashList
            key={"authors-" + String(width)}
            showsVerticalScrollIndicator={false}
            horizontal={false}
            numColumns={columns}
            data={data}
            ListEmptyComponent={
              <Flex>
                <Text>Empty :/</Text>
              </Flex>
            }
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            estimatedItemSize={139}
            ItemSeparatorComponent={() => <Flex h={20} />}
            contentContainerStyle={{
              paddingTop: 22,
              paddingBottom: 44,
            }}
          />
        </Flex>
      )}
    </Screen>
  );
};

export default AuthorsPage;
