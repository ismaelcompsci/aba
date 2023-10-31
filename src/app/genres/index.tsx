import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtom } from "jotai";
import {
  GroupProps,
  H3,
  ListItem,
  ScrollView,
  Separator,
  Spinner,
  YGroup,
  YStack,
} from "tamagui";

import { FullScreen, ScreenCenter } from "../../components/center";
import { progressFilters } from "../../constants/consts";
import { currentLibraryIdAtom, userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { LibraryFilterData } from "../../types/aba";

const GenreContainer = ({
  children,
  ...rest
}: { children: React.ReactNode } & GroupProps) => {
  return (
    <YGroup bordered alignSelf="center" separator={<Separator />} {...rest}>
      {children}
    </YGroup>
  );
};

const GenresPage = () => {
  const [user] = useAtom(userAtom);
  const [currentLibraryId] = useAtom(currentLibraryIdAtom);
  const [serverConfig] = useAtom(currentServerConfigAtom);

  const { bottom } = useSafeAreaInsets();

  const { data: filterData, isLoading } = useQuery({
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
    refetchOnMount: true,
  });

  const genres = filterData?.genres || [];
  // const authors = filterData?.authors || [];
  const languages = filterData?.languages || [];
  const tags = filterData?.tags || [];
  // const series = filterData?.series || [];
  const narrators = filterData?.narrators || [];

  return (
    <FullScreen flex={1}>
      <ScrollView bg="$background" flex={1} p={"$4"} space="$4">
        {isLoading ? (
          <ScreenCenter>
            <Spinner />
          </ScreenCenter>
        ) : null}
        {progressFilters ? (
          <>
            <H3>Progress</H3>
            <GenreContainer>
              {progressFilters.map((filter) => (
                <YGroup.Item key={filter}>
                  <ListItem>{filter}</ListItem>
                </YGroup.Item>
              ))}
            </GenreContainer>
          </>
        ) : null}
        {genres.length ? (
          <>
            <H3>Genres</H3>
            <GenreContainer>
              {genres.map((gen) => (
                <YGroup.Item key={gen}>
                  <ListItem>{gen}</ListItem>
                </YGroup.Item>
              ))}
            </GenreContainer>
          </>
        ) : null}

        {tags.length ? (
          <>
            <H3>tags</H3>
            <GenreContainer>
              {tags.map((tag) => (
                <YGroup.Item key={tag}>
                  <ListItem>{tag}</ListItem>
                </YGroup.Item>
              ))}
            </GenreContainer>
          </>
        ) : null}
        {languages.length ? (
          <>
            <H3>languages</H3>
            <GenreContainer>
              {languages.map((language) => (
                <YGroup.Item key={language}>
                  <ListItem>{language}</ListItem>
                </YGroup.Item>
              ))}
            </GenreContainer>
          </>
        ) : null}
        {narrators.length ? (
          <>
            <H3>narrators</H3>
            <GenreContainer>
              {narrators.map((narrator) => (
                <YGroup.Item key={narrator}>
                  <ListItem>{narrator}</ListItem>
                </YGroup.Item>
              ))}
            </GenreContainer>
          </>
        ) : null}
        <Separator h={bottom} w={0} />
      </ScrollView>
    </FullScreen>
  );
};

export default GenresPage;
