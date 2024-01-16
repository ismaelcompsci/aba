import { useMemo } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import { FadeInRight } from "react-native-reanimated";
import { Maximize2 } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { Text } from "tamagui";

import { LibraryFilterData } from "../../types/aba";
import { randomIntFromInterval } from "../../utils/utils";
import GenreCard from "../cards/genre-card";
import { AnimatedFlex, Flex } from "../layout/flex";
import { Skeleton } from "../skeleton";
import { TouchableArea } from "../touchable/touchable-area";

export const GenreCardList = ({
  currentLibraryId,
  userToken,
  serverAddress,
}: {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
}) => {
  const { data: filterData, isLoading } = useQuery({
    queryKey: ["filter-data", currentLibraryId, userToken, serverAddress],
    queryFn: async () => {
      if (!serverAddress) return null;
      const { data }: { data: LibraryFilterData } = await axios.get(
        `${serverAddress}/api/libraries/${currentLibraryId}/filterdata`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      return data;
    },
    staleTime: 1000 * 20,
  });

  const genres = filterData?.genres || [];
  const genreLength = genres.length || 0;
  const { width } = useWindowDimensions();

  const showGenres = useMemo(() => {
    const showGenreCards = [];

    const genreCardWidth = 124;
    let cardsNum = Math.ceil((width / genreCardWidth) * 2);

    if (cardsNum > genreLength) {
      cardsNum = genreLength;
    }

    const usedNumbers = new Set();

    for (let i = 0; i < cardsNum; i++) {
      let random;

      do {
        random = randomIntFromInterval(0, genreLength - 1);
      } while (usedNumbers.has(random));

      usedNumbers.add(random);
      showGenreCards.push(genres[random]);
    }

    return showGenreCards;
  }, [width, genreLength, currentLibraryId]);

  return (
    <AnimatedFlex space="$2" entering={FadeInRight}>
      <Flex centered row px="$4" py="$2" jc="space-between" alignItems="center">
        <Text fontSize="$6" bg="$background">
          Genres
        </Text>
        <TouchableArea
          hapticFeedback
          onPress={() => router.push("/genres/")}
          accessible
          accessibilityLabel="Expand Genres"
          accessibilityHint="Go to list of all genres"
        >
          <Maximize2 size={"$1"} />
        </TouchableArea>
      </Flex>
      {showGenres.length && !isLoading ? (
        <FlatList
          data={showGenres}
          horizontal
          contentContainerStyle={{
            paddingBottom: 6,
          }}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <Flex w={15} />}
          renderItem={({ item, index }) => (
            <Flex
              pl={index === 0 ? "$4" : null}
              key={index}
              accessible
              accessibilityLabel={item}
            >
              <GenreCard genre={item} />
            </Flex>
          )}
        />
      ) : (
        <Flex pl="$4" row space={"$4"}>
          <Skeleton
            w={124}
            h={"$8"}
            bg={"$backgroundPress"}
            opacity={1}
            borderRadius={8}
          />
          <Skeleton
            w={124}
            h={"$8"}
            bg={"$backgroundPress"}
            opacity={1}
            borderRadius={8}
          />
          <Skeleton
            w={124}
            h={"$8"}
            bg={"$backgroundPress"}
            opacity={1}
            borderRadius={8}
          />
          <Skeleton
            w={124}
            h={"$8"}
            bg={"$backgroundPress"}
            opacity={1}
            borderRadius={8}
          />
        </Flex>
      )}
    </AnimatedFlex>
  );
};
