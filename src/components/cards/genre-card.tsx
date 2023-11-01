import { ArrowRight } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Card, Text, XStack, YStack } from "tamagui";

import useIconTheme from "../../hooks/use-icon-theme";
import { encode } from "../../utils/utils";

const GenreCard = ({ genre }: { genre: string }) => {
  const { bg, color } = useIconTheme();

  const handleGenreCardPress = () => {
    router.push(`/library/genres/${encode(genre)}`);
  };

  return (
    <Card
      w={124}
      h={"$8"}
      elevate
      elevation={"$0.75"}
      pressStyle={{ scale: 0.8 }}
      animation={"bouncy"}
      onPress={handleGenreCardPress}
    >
      <YStack flex={1}>
        <YStack
          bg={color}
          r={0}
          borderBottomLeftRadius={"$10"}
          borderTopRightRadius={"$3"}
          pos="absolute"
          h={"$3"}
          w={"$4"}
        >
          <XStack jc="center" p="$1.5">
            <ArrowRight color={bg} size={"$1"} />
          </XStack>
        </YStack>
        <Text
          pos="absolute"
          b="$2"
          l="$2"
          fontWeight={"$10"}
          fontSize={"$4"}
          numberOfLines={2}
          w={110}
        >
          {genre}
        </Text>
      </YStack>
    </Card>
  );
};

export default GenreCard;
