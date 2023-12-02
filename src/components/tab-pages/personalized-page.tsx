import { memo, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { FadeInRight } from "react-native-reanimated";
import { Maximize2 } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { ScrollView, Separator, Spinner, Stack, Text } from "tamagui";

import BookShelf from "../../components/library/bookshelf";
import { changingLibraryAtom } from "../../state/app-state";
import { LibraryFilterData } from "../../types/aba";
import { PersonalizedView } from "../../types/types";
import { randomIntFromInterval } from "../../utils/utils";
import GenreCard from "../cards/genre-card";
import { VirtualizedList } from "../custom-components/virtual-scroll-view";
import { AnimatedFlex, Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { TouchableArea } from "../touchable/touchable-area";

interface PersonalizedPageProps {
  currentLibraryId: string | null;
  serverAddress: string;
  userToken: string;
  isCoverSquareAspectRatio: boolean;
}

const PersonalizedPage = ({
  currentLibraryId,
  serverAddress,
  userToken,
  isCoverSquareAspectRatio,
}: PersonalizedPageProps) => {
  const changingLibrary = useAtomValue(changingLibraryAtom);

  const {
    data: personalizedLibrary,
    isLoading,
    isInitialLoading,
  } = useQuery(
    ["personalized-library-view", currentLibraryId, userToken, serverAddress],
    {
      queryFn: async (): Promise<PersonalizedView[] | undefined> => {
        try {
          if (!serverAddress) return [];
          const response = await axios.get(
            `${serverAddress}/api/libraries/${currentLibraryId}/personalized?minified=1&include=rssfeed,numEpisodesIncomplete`,
            { headers: { Authorization: `Bearer ${userToken}` } }
          );

          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.log({ error, PEROSONALIZED: "ERROR" });
          }
        }
      },
      staleTime: 1000 * 60 * 60,
    }
  );

  const isEmpty = personalizedLibrary?.length === 0 && !isLoading;

  return (
    <Screen
      headerAndTabBar={
        isInitialLoading || isLoading || changingLibrary || isEmpty
          ? true
          : false
      }
    >
      <VirtualizedList>
        <GenreCardList
          currentLibraryId={currentLibraryId}
          serverAddress={serverAddress}
          userToken={userToken}
        />
        {isInitialLoading || isLoading || changingLibrary || isEmpty ? (
          <Flex h="100%">
            {isEmpty ? (
              <Text>EMPTY :/</Text>
            ) : (
              <Flex>
                <Spinner />
              </Flex>
            )}
          </Flex>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            bg={"$background"}
            h={"100%"}
            space={"$3"}
            pt={"$3"}
          >
            {personalizedLibrary?.map((library: PersonalizedView) => (
              <AnimatedFlex key={library.id} entering={FadeInRight}>
                <BookShelf
                  isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                  shelf={library}
                  serverAddress={serverAddress}
                  token={userToken}
                />
              </AnimatedFlex>
            ))}
            <Separator w={0} pb={24} />
          </ScrollView>
        )}
      </VirtualizedList>
    </Screen>
  );
};

const GenreCardList = ({
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
    staleTime: 1000 * 60 * 60,
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

  if (isLoading) {
    return null;
  }

  return (
    <AnimatedFlex space="$2" entering={FadeInRight}>
      <Flex centered row px="$4" py="$2" jc="space-between" alignItems="center">
        <Text fontSize="$6" bg="$background">
          Genres
        </Text>
        <TouchableArea hapticFeedback onPress={() => router.push("/genres/")}>
          <Maximize2 size={"$1"} />
        </TouchableArea>
      </Flex>
      {showGenres.length ? (
        <ScrollView
          showsHorizontalScrollIndicator={false}
          horizontal
          space="$4"
          pb="$2"
        >
          {showGenres.map((genre, index) => (
            <Stack pl={index === 0 ? "$4" : null} key={index}>
              <GenreCard genre={genre} />
            </Stack>
          ))}
        </ScrollView>
      ) : null}
    </AnimatedFlex>
  );
};

export default memo(PersonalizedPage);
