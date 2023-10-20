/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ScrollView, Spinner, View } from "tamagui";

import BookShelf from "../../components/library/bookshelf";
import { Library, User } from "../../types/aba";
import { PersonalizedView, ServerConfig } from "../../types/types";
import { ScreenCenter } from "../center";
import { PageView } from "./page-view";

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
  const isCoverSquareAspectRatio = library?.settings.coverAspectRatio === 1;

  const { data: personalizedLibrary, isLoading } = useQuery(
    ["personalized-library-view"],
    {
      queryFn: async (): Promise<PersonalizedView[]> => {
        const response = await axios.get(
          `${serverConfig?.serverAddress}/api/libraries/${currentLibraryId}/personalized?minified=1&include=rssfeed`,
          { headers: { Authorization: `Bearer ${user?.token}` } }
        );
        return response.data;
      },
    }
  );

  return (
    <PageView>
      {isLoading ? (
        // HEIGHT OF HEADER PLUS TAB BAR
        <ScreenCenter pb={94 + 44}>
          <Spinner />
        </ScreenCenter>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          bg={"$background"}
          h={"100%"}
          space={"$3"}
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
        </ScrollView>
      )}
    </PageView>
  );
};

export default PersonalizedPage;
