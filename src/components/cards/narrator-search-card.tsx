import { SatelliteDish } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Stack, Text } from "tamagui";

import { SearchNarratorResult } from "../../types/types";

import { SearchCard } from "./search-card";

const NarratorSearchCard = ({
  narrator,
}: {
  narrator: SearchNarratorResult;
}) => {
  const handlePress = () => {
    router.push(`/library/narrator/${narrator.name}`);
  };
  return (
    <SearchCard onPress={handlePress}>
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
    </SearchCard>
  );
};

export default NarratorSearchCard;
