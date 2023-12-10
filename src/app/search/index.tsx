import { useState } from "react";
import { Search } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAtomValue } from "jotai";
import { ScrollView, Spinner, styled, Text, YStack } from "tamagui";

import AuthorSearchCard from "../../components/cards/author-search-card";
import ItemSearchCard from "../../components/cards/item-search-card";
import NarratorSearchCard from "../../components/cards/narrator-search-card";
import SeriesSearchCard from "../../components/cards/series-search-card";
import InputWithIcon from "../../components/custom-components/input-with-icon";
import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import useDebounce from "../../hooks/use-debounce";
import {
  currentLibraryAtom,
  currentLibraryIdAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { AuthorExpanded } from "../../types/aba";
import {
  SearchNarratorResult,
  SearchResult,
  SearchSeriesResult,
} from "../../types/types";

const SearchPage = () => {
  const libId = useAtomValue(currentLibraryIdAtom);
  const library = useAtomValue(currentLibraryAtom);
  const userToken = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);

  const [bookResults, setBookResults] = useState<SearchResult[]>([]);
  const [podcastResults, setPodcastResults] = useState<SearchResult[]>([]);
  const [seriesResults, setSeriesResults] = useState<SearchSeriesResult[]>([]);
  const [authorResults, setAuthorResults] = useState<AuthorExpanded[]>([]);
  const [narratorResults, setNarratorResults] = useState<
    SearchNarratorResult[]
  >([]);
  const [searchInput, setSearchInput] = useState("");

  const [debouncedSearchInput] = useDebounce(searchInput, 500);

  const isCoverSquareAspectRatio = library?.settings.coverAspectRatio === 1;

  const resultsLength =
    bookResults?.length +
    podcastResults?.length +
    seriesResults?.length +
    authorResults?.length +
    narratorResults?.length;

  const { isLoading, isFetching } = useQuery({
    queryKey: [
      "debounced-search",
      {
        // This is the key part. We use the debounced search input in the
        // query key so that the query is debounced.
        searchInput: debouncedSearchInput,
        libId,
      },
    ],
    queryFn: async () => {
      if (!debouncedSearchInput || debouncedSearchInput === "") {
        clearResults();
        return { data: "ok" };
      }

      const { data } = await axios.get(
        `${serverAddress}/api/libraries/${libId}/search`,
        {
          params: {
            q: debouncedSearchInput,
            limit: 5,
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
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
    setSeriesResults([]);
    setAuthorResults([]);
    setPodcastResults([]);
    setNarratorResults([]);
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <BackHeader alignment="center" mx={16} pt={16}>
        <Text fontSize="$6">Search</Text>
      </BackHeader>
      {/* search */}
      <Flex px={"$4"} py={"$4"}>
        <InputWithIcon
          placeholder={"Search"}
          onChangeText={setSearchInput}
          icon={Search}
        />
      </Flex>
      {/* results */}
      <ScrollView space="$4" showsVerticalScrollIndicator={false}>
        {isLoading || isFetching ? (
          <Flex fill centered>
            <Spinner />
          </Flex>
        ) : !resultsLength && !isLoading && debouncedSearchInput ? (
          <Flex fill centered>
            <Text>Not found :/</Text>
          </Flex>
        ) : null}

        {bookResults.length ? (
          <ResultSection>
            <Text>Books</Text>
            {bookResults.map(({ libraryItem }) => {
              return (
                <ItemSearchCard
                  key={libraryItem.id}
                  item={libraryItem}
                  serverAddress={serverAddress}
                  token={userToken}
                  isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                />
              );
            })}
          </ResultSection>
        ) : null}
        {seriesResults.length ? (
          <ResultSection>
            <Text>Series</Text>
            {seriesResults.map(({ books, series }) => {
              return (
                <SeriesSearchCard
                  key={series.id}
                  series={series}
                  books={books}
                  serverAddress={serverAddress}
                  token={userToken}
                  isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                />
              );
            })}
          </ResultSection>
        ) : null}
        {podcastResults.length ? (
          <ResultSection>
            <Text>Podcasts</Text>
            {podcastResults.map(({ libraryItem }) => {
              return (
                <ItemSearchCard
                  key={libraryItem.id}
                  item={libraryItem}
                  serverAddress={serverAddress}
                  token={userToken}
                  isCoverSquareAspectRatio={isCoverSquareAspectRatio}
                />
              );
            })}
          </ResultSection>
        ) : null}
        {authorResults.length ? (
          <ResultSection>
            <Text>Authors</Text>
            {authorResults.map((author, i) => {
              return (
                <AuthorSearchCard
                  key={i}
                  author={author}
                  serverAddress={serverAddress}
                  token={userToken}
                />
              );
            })}
          </ResultSection>
        ) : null}
        {narratorResults.length ? (
          <ResultSection>
            <Text>Narrators</Text>
            {narratorResults.map((narrator, i) => {
              return <NarratorSearchCard key={i} narrator={narrator} />;
            })}
          </ResultSection>
        ) : null}
      </ScrollView>
    </Screen>
  );
};

const ResultSection = styled(YStack, {
  space: "$4",
  paddingHorizontal: "$4",
});

export default SearchPage;
