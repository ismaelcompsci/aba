import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import { useAtom } from "jotai";
import { Separator, Text } from "tamagui";

import { VirtualizedList } from "../../components/custom-components/virtual-scroll-view";
import BackHeader from "../../components/layout/back-header";
import { Screen } from "../../components/layout/screen";
import { Loaders } from "../../components/loader";
import { GenreList } from "../../components/tables/genre-table";
import { progressFilters } from "../../constants/consts";
import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { currentLibraryIdAtom, userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { LibraryFilterData } from "../../types/aba";
import { encode } from "../../utils/utils";

const GenresPage = () => {
  const [user] = useAtom(userAtom);
  const [currentLibraryId] = useAtom(currentLibraryIdAtom);
  const [serverConfig] = useAtom(currentServerConfigAtom);

  const { bottom } = useAppSafeAreas();

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
  });

  const genres = filterData?.genres || [];
  const languages = filterData?.languages || [];
  const tags = filterData?.tags || [];

  const onFilterPressed = ({
    item,
    filter,
  }: {
    item: string;
    filter: string;
  }) => {
    router.push(`/library/${filter}/${encode(item)}`);
  };

  const FilterLists = useMemo(
    () => (
      <VirtualizedList
        showsVerticalScrollIndicator={false}
        style={{ paddingBottom: bottom, paddingHorizontal: 24 }}
      >
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

        <Separator h={bottom} w={0} />
      </VirtualizedList>
    ),
    [genres.length, languages.length, tags.length]
  );

  return (
    <Screen edges={["top", "left", "right"]}>
      <BackHeader alignment="center" mx={16} py={16}>
        <Text fontSize="$6">Genres</Text>
      </BackHeader>
      {isLoading ? <Loaders.Main /> : FilterLists}
    </Screen>
  );
};

export default GenresPage;
