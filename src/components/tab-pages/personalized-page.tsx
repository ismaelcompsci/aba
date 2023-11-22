import { memo, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { FadeInUp } from "react-native-reanimated";
import { Maximize2 } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { ScrollView, Separator, Spinner, Stack, Text } from "tamagui";

import BookShelf from "../../components/library/bookshelf";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { changingLibraryAtom } from "../../state/app-state";
import { LibraryFilterData } from "../../types/aba";
import { PersonalizedView, ServerConfig } from "../../types/types";
import { randomIntFromInterval } from "../../utils/utils";
import GenreCard from "../cards/genre-card";
import { AnimatedFlex, Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { TouchableArea } from "../touchable/touchable-area";

interface PersonalizedPageProps {
  currentLibraryId: string | null;
  serverConfig: ServerConfig | null;
  userToken: string;
  isCoverSquareAspectRatio: boolean;
}

const PersonalizedPage = ({
  currentLibraryId,
  serverConfig,
  userToken,
  isCoverSquareAspectRatio,
}: PersonalizedPageProps) => {
  const changingLibrary = useAtomValue(changingLibraryAtom);
  const { bottom } = useAppSafeAreas();

  const {
    data: personalizedLibrary,
    isLoading,
    isInitialLoading,
  } = useQuery(
    [
      "personalized-library-view",
      currentLibraryId,
      userToken,
      serverConfig?.id,
    ],
    {
      queryFn: async (): Promise<PersonalizedView[] | undefined> => {
        try {
          if (!serverConfig?.id) return [];
          const response = await axios.get(
            `${serverConfig?.serverAddress}/api/libraries/${currentLibraryId}/personalized?minified=1&include=rssfeed`,
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
      centered
      headerAndTabBar={
        isInitialLoading || isLoading || changingLibrary || isEmpty
          ? true
          : false
      }
    >
      {isInitialLoading || isLoading || changingLibrary || isEmpty ? (
        <>{isEmpty ? <Text>EMPTY</Text> : <Spinner />}</>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          bg={"$background"}
          h={"100%"}
          space={"$3"}
          pt={"$3"}
        >
          <GenresScrollView
            currentLibraryId={currentLibraryId}
            serverConfig={serverConfig}
            userToken={userToken}
          />
          {personalizedLibrary?.map((library: PersonalizedView) => (
            <BookShelf
              isCoverSquareAspectRatio={isCoverSquareAspectRatio}
              key={library.id}
              shelf={library}
              serverConfig={serverConfig}
              token={userToken}
            />
          ))}
          <Separator w={0} pb={bottom} />
        </ScrollView>
      )}
    </Screen>
  );
};

const GenresScrollView = ({
  currentLibraryId,
  userToken,
  serverConfig,
}: {
  currentLibraryId: string | null;
  serverConfig: ServerConfig | null;
  userToken: string;
}) => {
  const { data: filterData } = useQuery({
    queryKey: ["filter-data", currentLibraryId, userToken, serverConfig?.id],
    queryFn: async () => {
      if (!serverConfig?.id) return null;
      const { data }: { data: LibraryFilterData } = await axios.get(
        `${serverConfig?.serverAddress}/api/libraries/${currentLibraryId}/filterdata`,
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

  return (
    <Flex space="$2">
      <Flex centered row px="$4" py="$2" jc="space-between">
        {/* todo make component personalized header text */}
        <Text fontSize="$6" bg="$background">
          Genres
        </Text>
        <TouchableArea hapticFeedback onPress={() => router.push("/genres/")}>
          <Maximize2 size={"$1"} />
        </TouchableArea>
      </Flex>
      {showGenres.length ? (
        <AnimatedFlex entering={FadeInUp}>
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
        </AnimatedFlex>
      ) : null}
    </Flex>
  );
};

export default memo(PersonalizedPage);
