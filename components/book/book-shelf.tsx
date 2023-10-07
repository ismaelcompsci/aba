import { Text, View, YStack } from "tamagui";
import { PersonalizedView } from "../../types/server";
import { useAtomValue } from "jotai/react";
import { currentServerConfigAtom } from "../../utils/local-atoms";
import { FlatList } from "react-native";
import BookCard from "./book-card";
import { currentUserAtom } from "../../utils/atoms";

interface BookShelfProps {
  shelf: PersonalizedView;
  isCoverSquareAspectRatio: boolean;
}

const BookShelf = ({ shelf, isCoverSquareAspectRatio }: BookShelfProps) => {
  const user = useAtomValue(currentUserAtom);
  const currentServerConfig = useAtomValue(currentServerConfigAtom);

  if (!user) {
    console.log("[BOOKSHELF] no user");
    return;
  }

  // TODO HANDLE these
  if (shelf.label === "Newest Authors") {
    return null;
  }

  if (shelf.label === "Recent Series") {
    return null;
  }

  return (
    <YStack w={"100%"} space={"$2"} bg={"$background"}>
      <Text pl={"$2"} fontSize={"$4"}>
        {shelf.label}
      </Text>
      <FlatList
        data={shelf.entities || []}
        horizontal
        ItemSeparatorComponent={() => <View w={10} />}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            isCoverSquareAspectRatio={isCoverSquareAspectRatio}
            key={item.id}
            currentServerConfig={currentServerConfig}
            item={item}
            token={user.token}
          />
        )}
      />
    </YStack>
  );
};

export default BookShelf;
