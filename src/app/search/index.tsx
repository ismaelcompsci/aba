import { useState } from "react";
import { Search } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtomValue } from "jotai";
import { ScrollView, Spinner, Text, XStack, YStack } from "tamagui";

import ItemSearchCard from "../../components/cards/item-search-card";
import SeriesSearchCard from "../../components/cards/series-search-card";
import { ScreenCenter } from "../../components/center";
import InputWithIcon from "../../components/custom-components/input-with-icon";
import useDebounce from "../../hooks/use-debounce";
import {
  currentLibraryAtom,
  currentLibraryIdAtom,
  userAtom,
} from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { SearchResult, SearchSeriesResult } from "../../types/types";

const SearchPage = () => {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const libId = useAtomValue(currentLibraryIdAtom);
  const library = useAtomValue(currentLibraryAtom);

  const [bookResults, setBookResults] = useState<SearchResult[]>([]);
  const [podcastResults, setPodcastResults] = useState<SearchResult[]>([]);
  const [seriesResults, setSeriesResults] = useState<SearchSeriesResult[]>([]);
  const [authorResults, setAuthorResults] = useState<SearchResult[]>([]);
  const [narratorResults, setNarratorResults] = useState<SearchResult[]>([]);
  const [searchInput, setSearchInput] = useState("");

  const [debouncedSearchInput] = useDebounce(searchInput, 500);

  const isCoverSquareAspectRatio = library?.settings.coverAspectRatio === 1;

  const resultsLength =
    bookResults?.length +
    podcastResults?.length +
    seriesResults?.length +
    authorResults?.length +
    narratorResults?.length;

  const { isLoading } = useQuery({
    queryKey: [
      "debounced-search",
      {
        // This is the key part. We use the debounced search input in the
        // query key so that the query is debounced.
        searchInput: debouncedSearchInput,
      },
    ],
    queryFn: async () => {
      if (!debouncedSearchInput || debouncedSearchInput === "") {
        clearResults();
        return { data: "ok" };
      }

      const { data } = await axios.get(
        `${serverConfig.serverAddress}/api/libraries/${libId}/search`,
        {
          params: {
            q: debouncedSearchInput,
            limit: 5,
          },
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      setBookResults(data.book || []);
      setPodcastResults(data.podcast || []);
      setSeriesResults(data.series || []);
      setAuthorResults(data.authors || []);
      setNarratorResults(data.narrators || []);

      return { data: "ok" };
    },
  });

  const clearResults = () => {
    setBookResults([]);
    setPodcastResults([]);
    setAuthorResults([]);
    setNarratorResults([]);
    setSeriesResults([]);
  };

  return (
    <YStack h="100%" w="100%" bg="$background" px="$2">
      {/* search */}
      <XStack alignItems="center" pt="$4">
        <InputWithIcon
          placeholder={"Search"}
          onChangeText={setSearchInput}
          icon={Search}
        />
      </XStack>
      {/* results */}
      <ScrollView space="$4" pt="$4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ScreenCenter>
            <Spinner />
          </ScreenCenter>
        ) : null}
        {!resultsLength && !isLoading && debouncedSearchInput ? (
          <ScreenCenter>
            <Text>Not found :/</Text>
          </ScreenCenter>
        ) : null}

        {bookResults.length ? (
          <YStack space="$4" w="100%">
            <Text>Books</Text>
            {bookResults.map(({ libraryItem }) => {
              return (
                <ItemSearchCard
                  key={libraryItem.id}
                  item={libraryItem}
                  serverConfig={serverConfig}
                  token={user?.token}
                  isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                />
              );
            })}
          </YStack>
        ) : null}
        {seriesResults.length ? (
          <YStack space="$4">
            <Text>Series</Text>
            {seriesResults.map(({ books, series }) => {
              return (
                <SeriesSearchCard
                  key={series.id}
                  series={series}
                  books={books}
                  serverConfig={serverConfig}
                  token={user?.token}
                  isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                />
              );
            })}
          </YStack>
        ) : null}
        {podcastResults.length ? (
          <YStack space="$4">
            <Text>Books</Text>
            {bookResults.map(({ libraryItem }) => {
              return (
                <Text key={libraryItem.id}>
                  {libraryItem.media.metadata.title}
                </Text>
              );
            })}
          </YStack>
        ) : null}
        {authorResults.length ? (
          <YStack space="$4">
            <Text>Authors</Text>
            {bookResults.map(({ libraryItem }) => {
              return (
                <Text key={libraryItem.id}>
                  {libraryItem.media.metadata.title}
                </Text>
              );
            })}
          </YStack>
        ) : null}
        {narratorResults.length ? (
          <YStack space="$4">
            <Text>Narrators</Text>
            {bookResults.map(({ libraryItem }) => {
              return (
                <Text key={libraryItem.id}>
                  {libraryItem.media.metadata.title}
                </Text>
              );
            })}
          </YStack>
        ) : null}
      </ScrollView>
    </YStack>
  );
};

export default SearchPage;
