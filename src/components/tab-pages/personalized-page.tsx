import { memo, useMemo } from "react";
import { FadeIn, FadeInRight } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtomValue } from "jotai";
import { ScrollView, Separator, Text } from "tamagui";

import BookShelf from "../../components/library/bookshelf";
import { changingLibraryAtom } from "../../state/app-state";
import { PersonalizedView } from "../../types/types";
import { AnimatedFlex, Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { ContinueListeningShelf } from "../library/continue-listening-shelf";
import { GenreCardList } from "../library/genre-card-list";
import { Skeleton } from "../skeleton";

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
    isFetching,
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
      staleTime: 1000 * 20,
    }
  );

  const isEmpty = personalizedLibrary?.length === 0 && !isLoading;
  const personalizedLibraryShelfs = useMemo(
    () =>
      personalizedLibrary?.filter(
        (shelf) => shelf?.label !== "Continue Listening"
      ),
    [currentLibraryId, isLoading]
  );

  const continueListeningShelf = personalizedLibrary?.[0];
  const bookWidth = isCoverSquareAspectRatio ? 100 * 1.6 : 100;
  const bookHeight = isCoverSquareAspectRatio ? bookWidth : bookWidth * 1.6;

  return (
    <Screen
      edges={["left", "right"]}
      headerAndTabBar={
        isInitialLoading || isLoading || changingLibrary || isEmpty
          ? true
          : false
      }
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {!isLoading && continueListeningShelf && !isFetching ? (
          <ContinueListeningShelf shelf={continueListeningShelf} />
        ) : (
          <Flex
            row
            space={"$4"}
            style={{
              paddingHorizontal: 18,
              paddingTop: 12,
              paddingBottom: 12,
            }}
            height={324 + 20}
          >
            <Skeleton>
              <Flex
                bg="$backgroundPress"
                height={324}
                width={248}
                borderRadius={8}
              />
            </Skeleton>
            <Skeleton>
              <Flex
                bg="$backgroundPress"
                height={324}
                width={248}
                borderRadius={8}
              />
            </Skeleton>
          </Flex>
        )}
        <GenreCardList
          currentLibraryId={currentLibraryId}
          serverAddress={serverAddress}
          userToken={userToken}
        />
        {isInitialLoading ||
        isLoading ||
        changingLibrary ||
        isEmpty ||
        isFetching ? (
          isEmpty ? (
            <Text>EMPTY :/</Text>
          ) : (
            <Flex row pt={"$3"} pl={"$4"}>
              <Flex gap="$4">
                <Skeleton
                  h="$1"
                  bg="$backgroundPress"
                  w="$8"
                  borderRadius={8}
                />

                <Flex row space="$4">
                  <Skeleton
                    borderRadius={8}
                    h={bookHeight}
                    w={bookWidth}
                    bg="$backgroundPress"
                  />
                  <Skeleton
                    borderRadius={8}
                    h={bookHeight}
                    w={bookWidth}
                    bg="$backgroundPress"
                  />

                  <Skeleton
                    borderRadius={8}
                    h={bookHeight}
                    w={bookWidth}
                    bg="$backgroundPress"
                  />
                </Flex>
              </Flex>
            </Flex>
          )
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
      </ScrollView>
    </Screen>
  );
};

export default memo(PersonalizedPage);
