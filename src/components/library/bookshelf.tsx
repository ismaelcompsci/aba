import { FlatList } from "react-native";
import { styled, Text, useTheme } from "tamagui";

import { PersonalizedView, ServerConfig } from "../../types/types";
import BookCard from "../cards/book-card";
import { Flex } from "../layout/flex";

interface BookShelfProps {
  shelf: PersonalizedView;
  isCoverSquareAspectRatio: boolean;
  token?: string;
  serverConfig: ServerConfig | null;
}

const BookShelf = ({
  shelf,
  isCoverSquareAspectRatio,
  token,
  serverConfig,
}: BookShelfProps) => {
  const theme = useTheme();
  const bg = theme.background.get();

  if (shelf.label === "Newest Authors") {
    return null;
  }
  if (shelf.label === "Recent Series") {
    return null;
  }
  return (
    <Flex>
      <ShelfLabel>{shelf.label}</ShelfLabel>
      <FlatList
        data={shelf.entities || []}
        horizontal
        ItemSeparatorComponent={() => <Flex w={10} />}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: bg,
        }}
        renderItem={({ item, index }) => (
          <Flex
            pl={index === 0 ? "$4" : null}
            pr={index === shelf.entities.length - 1 ? "$4" : null}
          >
            <BookCard
              pt={"$2"}
              isCoverSquareAspectRatio={isCoverSquareAspectRatio}
              key={item.id}
              serverConfig={serverConfig}
              item={item}
              token={token}
            />
          </Flex>
        )}
      />
    </Flex>
  );
};

const ShelfLabel = styled(Text, {
  pl: "$4",
  fontSize: "$6",
  bg: "$background",
});

export default BookShelf;
