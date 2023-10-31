/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useAtomValue } from "jotai";
import { ScrollView, Separator, Spinner, Text } from "tamagui";

import BookShelf from "../../components/library/bookshelf";
import { changingLibraryAtom } from "../../state/app-state";
import { Library, User } from "../../types/aba";
import { PersonalizedView, ServerConfig } from "../../types/types";
import { ScreenCenter } from "../center";

import { PageView } from "./page-view";
import { prettyLog } from "../../utils/utils";

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

  const isCoverSquareAspectRatio = library?.settings.coverAspectRatio === 1;

  console.log({ serverConfig });

  const {
    data: personalizedLibrary,
    isLoading,
    isInitialLoading,
  } = useQuery(["personalized-library-view", currentLibraryId, user?.id], {
    queryFn: async (): Promise<PersonalizedView[]> => {
      try {
        console.log({ serverConfig });
        const response = await axios.get(
          `${serverConfig?.serverAddress}/api/libraries/${currentLibraryId}/personalized?minified=1&include=rssfeed`,
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log(error);
          // prettyLog(error);
        }
        console.log({ error, PEROSONALIZED: "ERROR" });

        throw new Error();
      }
    },
  });

  const isEmpty = personalizedLibrary?.length === 0 && !isLoading;

  return (
    <PageView>
      {isInitialLoading || isLoading || changingLibrary || isEmpty ? (
        <ScreenCenter>
          {isEmpty ? <Text>EMPTY</Text> : <Spinner />}
        </ScreenCenter>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          bg={"$background"}
          h={"100%"}
          space={"$3"}
          pt={"$3"}
        >
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
    </PageView>
  );
};

export default PersonalizedPage;
