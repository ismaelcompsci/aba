import { router } from "expo-router";
import { Button, ScrollView, ScrollViewProps, Text } from "tamagui";

import { encode } from "../utils/utils";

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
        <Button
          h="$2"
          br="$10"
          noTextWrap
          key={gen}
          bordered
          transparent
          onPress={() => handleGenrePress(gen)}
        >
          <Text numberOfLines={1} maxWidth={200}>
            {gen}
          </Text>
        </Button>
      ))}
    </ScrollView>
  );
};

export default GenresLabelScroll;
