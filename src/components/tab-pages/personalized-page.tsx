import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { Maximize2 } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import {
  ScrollView,
  Separator,
  Spinner,
  Stack,
  Text,
  XStack,
  YStack,
} from "tamagui";

import BookShelf from "../../components/library/bookshelf";
import { changingLibraryAtom } from "../../state/app-state";
import { Library, LibraryFilterData, User } from "../../types/aba";
import { PersonalizedView, ServerConfig } from "../../types/types";
import { randomIntFromInterval } from "../../utils/utils";
import { ClearIconButton } from "../buttons/button";
import GenreCard from "../cards/genre-card";
import { FullScreen, ScreenCenterWithTabBar } from "../center";

interface PersonalizedPageProps {
  library: Library | null;
  currentLibraryId: string | null;
  user: User | null;
  serverConfig: ServerConfig | null;
}

const PersonalizedPage = ({
  library,
  currentLibraryId,
  serverConfig,
  user,
}: PersonalizedPageProps) => {
  const changingLibrary = useAtomValue(changingLibraryAtom);
  const { width } = useWindowDimensions();

  const isCoverSquareAspectRatio = library?.settings.coverAspectRatio === 1;

  const {
    data: personalizedLibrary,
    isLoading,
    isInitialLoading,
  } = useQuery(
    ["personalized-library-view", currentLibraryId, user?.id, serverConfig?.id],
    {
      queryFn: async (): Promise<PersonalizedView[] | undefined> => {
        try {
          if (!serverConfig?.id) return [];
          const response = await axios.get(
            `${serverConfig?.serverAddress}/api/libraries/${currentLibraryId}/personalized?minified=1&include=rssfeed`,
            { headers: { Authorization: `Bearer ${user?.token}` } }
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

  const { data: filterData } = useQuery({
    queryKey: ["filter-data", currentLibraryId, user?.id, serverConfig?.id],
    queryFn: async () => {
      if (!serverConfig?.id) return null;
      const { data }: { data: LibraryFilterData } = await axios.get(
        `${serverConfig?.serverAddress}/api/libraries/${currentLibraryId}/filterdata`,
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );

      return data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const isEmpty = personalizedLibrary?.length === 0 && !isLoading;
  const genres = filterData?.genres || [];
  const genreLength = genres.length || 0;

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
    <FullScreen>
      {isInitialLoading || isLoading || changingLibrary || isEmpty ? (
        <ScreenCenterWithTabBar>
          {isEmpty ? <Text>EMPTY</Text> : <Spinner />}
        </ScreenCenterWithTabBar>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          bg={"$background"}
          h={"100%"}
          space={"$3"}
          pt={"$3"}
        >
          {genreLength ? (
            <YStack space="$2">
              <XStack px="$4" jc="space-between" ai="center">
                <Text fontSize="$6" bg="$background">
                  Genres
                </Text>
                <ClearIconButton onPress={() => router.push("/genres/")}>
                  <Maximize2 size={"$1"} />
                </ClearIconButton>
              </XStack>
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
            </YStack>
          ) : null}
          {personalizedLibrary?.map((library: PersonalizedView) => (
            <BookShelf
              isCoverSquareAspectRatio={isCoverSquareAspectRatio}
              key={library.id}
              shelf={library}
              serverConfig={serverConfig}
              token={user?.token}
            />
          ))}
          <Separator w={0} h={20} />
        </ScrollView>
      )}
    </FullScreen>
  );
};

export default PersonalizedPage;
