import { FlatList } from "react-native";
import { styled, Text, useTheme } from "tamagui";

import { LibraryItemMinified } from "../../types/aba";
import { PersonalizedView } from "../../types/types";
import BookCard from "../cards/book-card";
import { Flex } from "../layout/flex";

interface BookShelfProps {
  shelf: PersonalizedView;
  isCoverSquareAspectRatio: boolean;
  token?: string;
  serverAddress: string;
}

const BookShelf = ({
  shelf,
  isCoverSquareAspectRatio,
  token,
  serverAddress,
}: BookShelfProps) => {
  const theme = useTheme();
  const bg = theme.background.get();

  if (shelf.label === "Newest Authors") {
    return null;
  }
  if (shelf.label === "Recent Series") {
    return null;
  }

  const Card = ({
    type,
    item,
  }: {
    type: string;
    item: LibraryItemMinified;
  }) => {
    switch (type) {
      case "episode":
      case "podcast":
      case "book":
        return (
          <BookCard
            pt={"$2"}
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            serverAddress={serverAddress}
            item={item}
            token={token}
          />
        );
      default:
        break;
    }
  };

  return (
    <Flex>
      <ShelfLabel>{shelf.label}</ShelfLabel>
      <FlatList
        data={shelf.entities || []}
        horizontal
        ItemSeparatorComponent={() => <Flex w={10} />}
        keyExtractor={(item, index) => item.id + String(index) + "cards"}
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: bg,
        }}
        renderItem={({ item, index }) => (
          <Flex
            pl={index === 0 ? "$4" : null}
            pr={index === shelf.entities.length - 1 ? "$4" : null}
          >
            <Card item={item} type={shelf.type} />
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
