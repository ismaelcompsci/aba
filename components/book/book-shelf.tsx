import {
  Card,
  CardFooter,
  Image,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { PersonalizedView } from "../../types/server";
import { getItemCoverSrc } from "../../utils/helpers";
import { useAtomValue } from "jotai/react";
import {
  currentServerConfigAtom,
  currentUserAtom,
} from "../../utils/local-atoms";
import { FlatList } from "react-native";
import { PLACEHOLDER } from "../../constants/data-uris";
import BookCard from "./book-card";

interface BookShelfProps {
  shelf: PersonalizedView;
}

const BookShelf = ({ shelf }: BookShelfProps) => {
  const user = useAtomValue(currentUserAtom);
  const currentServerConfig = useAtomValue(currentServerConfigAtom);

  // TODO HANDLE these
  if (shelf.label === "Newest Authors") {
    console.log(shelf.type);

    return null;
  }

  if (shelf.label === "Recent Series") {
    console.log(shelf.type);
    return null;
  }

  return (
    <YStack w={"100%"} space={"$2"}>
      <Text fontSize={"$7"}>{shelf.label}</Text>
      <FlatList
        data={shelf.entities}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
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
