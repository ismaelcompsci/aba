import { router } from "expo-router";
import { ScrollView, ScrollViewProps, Text } from "tamagui";

import { encode } from "../utils/utils";

import { TouchableArea } from "./touchable/touchable-area";

const GenresLabelScroll = ({
  genres,
  ...rest
}: { genres: string[] } & ScrollViewProps) => {
  const handleGenrePress = (genre: string) => {
    router.push(`/library/genres/${encode(genre)}`);
  };

  return (
    <ScrollView {...rest}>
      {genres.map((gen) => (
        <TouchableArea
          h="$2"
          br="$10"
          px="$4"
          alignItems="center"
          justifyContent="center"
          key={gen}
          borderWidth={2}
          borderColor={"$borderColor"}
          onPress={() => handleGenrePress(gen)}
          accessible
          accessibilityLabel={`${gen} label`}
          accessibilityHint={`Go to list of books with genre ${gen}`}
        >
          <Text numberOfLines={1} maxWidth={200}>
            {gen}
          </Text>
        </TouchableArea>
      ))}
    </ScrollView>
  );
};

export default GenresLabelScroll;
