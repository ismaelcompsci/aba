import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { Separator, Spinner } from "tamagui";

import { FullScreen, ScreenCenter } from "../../components/center";
import VirtualScrollView from "../../components/custom-components/virtual-scroll-view";
import { GenreList } from "../../components/tables/genre-table";
import { progressFilters } from "../../constants/consts";
import { currentLibraryIdAtom, userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { LibraryFilterData } from "../../types/aba";
import { encode } from "../../utils/utils";

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

  const onFilterPressed = ({
    item,
    filter,
  }: {
    item: string;
    filter: string;
  }) => {
    router.push(`/library/${filter}/${encode(item)}`);
  };

  return (
    <FullScreen flex={1} bg="$background" p={"$4"} space="$4">
      {isLoading ? (
        <ScreenCenter>
          <Spinner />
        </ScreenCenter>
      ) : null}
      <VirtualScrollView showsVerticalScrollIndicator={false}>
        {progressFilters.length ? (
          <GenreList
            key={"progress"}
            filter="progress"
            data={progressFilters}
            title="Progress"
            onPress={onFilterPressed}
          />
        ) : null}
        {genres.length ? (
          <GenreList
            key={"genres"}
            data={genres}
            title="Genres"
            filter="genres"
            onPress={onFilterPressed}
          />
        ) : null}

        {tags.length ? (
          <GenreList
            key={"tags"}
            data={tags}
            title="Tags"
            filter="tags"
            onPress={onFilterPressed}
          />
        ) : null}
        {languages.length ? (
          <GenreList
            key={"languages"}
            data={languages}
            title="Languages"
            filter="languages"
            onPress={onFilterPressed}
          />
        ) : null}
        {narrators.length ? (
          <GenreList
            key={"narrators"}
            data={narrators}
            title="Narrators"
            filter="narrators"
            onPress={onFilterPressed}
          />
        ) : null}
        <Separator h={bottom} w={0} />
      </VirtualScrollView>
    </FullScreen>
  );
};

export default GenresPage;
