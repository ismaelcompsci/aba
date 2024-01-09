import { memo } from "react";
import { FadeIn, FadeInRight, FadeOut } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtomValue } from "jotai";
import { Separator, Text } from "tamagui";

import BookShelf from "../../components/library/bookshelf";
import { changingLibraryAtom } from "../../state/app-state";
import { PersonalizedView } from "../../types/types";
import { VirtualizedList } from "../custom-components/virtual-scroll-view";
import { AnimatedFlex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { ContinueListeningShelf } from "../library/continue-listening-shelf";
import { GenreCardList } from "../library/genre-card-list";
import { Loaders } from "../loader";

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

  const personalizedLibraryShelfs = personalizedLibrary?.filter(
    (shelf) => shelf?.label !== "Continue Listening"
  );

  const continueListeningShelf = personalizedLibrary?.[0];

  return (
    <Screen
      edges={["left", "right"]}
      headerAndTabBar={
        isInitialLoading || isLoading || changingLibrary || isEmpty
          ? true
          : false
      }
    >
      <VirtualizedList>
        {continueListeningShelf ? (
          <ContinueListeningShelf shelf={continueListeningShelf} />
        ) : null}
        <GenreCardList
          currentLibraryId={currentLibraryId}
          serverAddress={serverAddress}
          userToken={userToken}
        />
        {isInitialLoading || isLoading || changingLibrary || isEmpty ? (
          <AnimatedFlex pt={44} exiting={FadeOut}>
            {isEmpty ? <Text>EMPTY :/</Text> : <Loaders.Main />}
          </AnimatedFlex>
        ) : (
          <AnimatedFlex entering={FadeIn} space={"$3"} pt={"$3"}>
            {personalizedLibraryShelfs?.map((library: PersonalizedView) => {
              return (
                <AnimatedFlex
                  key={library.id + "home-page-view"}
                  entering={FadeInRight}
                >
                  <BookShelf
                    isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                    shelf={library}
                    serverAddress={serverAddress}
                    token={userToken}
                  />
                </AnimatedFlex>
              );
            })}
            <Separator w={0} pb={24} />
          </AnimatedFlex>
        )}
      </VirtualizedList>
    </Screen>
  );
};

export default memo(PersonalizedPage);
