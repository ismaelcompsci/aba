import { SatelliteDish } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Stack, Text, XStack } from "tamagui";

import { SearchNarratorResult } from "../../types/types";

const NarratorSearchCard = ({
  narrator,
}: {
  narrator: SearchNarratorResult;
}) => {
  const handlePress = () => {
    router.push(`/library/narrator/${narrator.name}`);
  };
  return (
    <XStack
      onPress={handlePress}
      pressStyle={{ opacity: 0.8 }}
      ai="center"
      w="100%"
      gap="$2"
    >
      <Stack
        w={40}
        h={40}
        bg="$backgroundFocus"
        br={"$4"}
        jc="center"
        ai="center"
      >
        <SatelliteDish />
      </Stack>
      <Text>{narrator.name}</Text>
    </XStack>
  );
};

export default NarratorSearchCard;
