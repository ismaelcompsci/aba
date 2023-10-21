import { FlatList } from "react-native";
import { Text, useTheme, View, YStack } from "tamagui";

import { PersonalizedView, ServerConfig } from "../../types/types";
import BookCard from "../cards/book-card";

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
    <YStack w={"100%"} h={"$18"} space={"$2"} bg={"$background"}>
      <Text pl={"$3"} fontSize={"$6"} bg={"$background"}>
        {shelf.label}
      </Text>
      <FlatList
        data={shelf.entities || []}
        horizontal
        ItemSeparatorComponent={() => <View w={10} />}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={{
          paddingHorizontal: 12,
          backgroundColor: bg,
        }}
        renderItem={({ item }) => (
          <BookCard
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            key={item.id}
            serverConfig={serverConfig}
            item={item}
            token={token}
          />
        )}
      />
    </YStack>
  );
};

export default BookShelf;
