import React, { useCallback, useState } from "react";
import FastImage from "react-native-fast-image";
import {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { ChevronLeft, Rss } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as Burnt from "burnt";
import { useFocusEffect } from "expo-router";
import { Separator, Spinner, Text } from "tamagui";

import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { PodcastFeed } from "../../types/aba";
import { PodcastSearch } from "../../types/types";
import InputWithIcon from "../custom-components/input-with-icon";
import { NewPodcastForm } from "../forms/podcast-form/new-podcast-form";
import { AnimatedFlex, Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { TouchableArea } from "../touchable/touchable-area";

interface AddPageProps {
  serverAddress: string;
  userToken: string;
}

const AddPage = ({ serverAddress, userToken }: AddPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [term, setTerm] = useState("");
  const [showSelectFeed, setShowSelectFeed] = useState(false);
  const [feedUrl, setFeedUrl] = useState<string | null>(null);
  const [selectedPodcastFeed, setSelectedPodcastFeed] = useState<
    PodcastFeed | undefined
  >(undefined);
  const [selectedPodcast, setSelectedPodcast] = useState<
    PodcastSearch | undefined
  >(undefined);

  const { headerHeight } = useAppSafeAreas();

  const {
    data: searchResult,
    refetch: refetchSearch,
    isFetching,
  } = useQuery({
    queryKey: ["podcast-search", term],
    queryFn: async () => {
      try {
        if (!term) return [];

        const response: { data: PodcastSearch[] } = await axios.get(
          `${serverAddress}/api/search/podcast`,
          {
            params: {
              term: encodeURIComponent(term),
            },
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        console.log("[ADD_PAGE] error ", error);
      }
    },
  });

  const { isLoading: feedIsLoading, isFetching: feedIsFetching } = useQuery({
    queryKey: ["podcast-feed", feedUrl],
    queryFn: async () => {
      try {
        if (!feedUrl) return {};
        const response: { data: { podcast: PodcastFeed } } = await axios.post(
          `${serverAddress}/api/podcasts/feed`,
          { rssFeed: feedUrl },
          {
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        setSelectedPodcastFeed(response.data?.podcast);
        return response.data.podcast;
      } catch (error) {
        Burnt.toast({
          title: "Failed to get Podcast feed",
          preset: "error",
        });
      }
    },
  });

  const selectPodcast = async (item: PodcastSearch) => {
    if (!item.feedUrl) {
      Burnt.toast({
        title: "Invalid Podcast",
        message: "no feed",
        preset: "error",
      });
      return;
    }

    setSelectedPodcast(item);
    setShowSelectFeed(true);
    setFeedUrl(item.feedUrl);
  };

  const hideForm = () => {
    if (showSelectFeed && selectedPodcast && feedUrl) {
      setShowSelectFeed(false);
      setFeedUrl(null);
      setSelectedPodcast(undefined);
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        hideForm();
      };
    }, [])
  );

  return (
    <Screen edges={["left", "right"]}>
      <AnimatedFlex
        px={"$4"}
        fill
        entering={SlideInLeft}
        exiting={SlideOutLeft}
      >
        <Flex pb={"$4"} pt="$2">
          <InputWithIcon
            icon={Rss}
            onChangeText={setSearchTerm}
            value={searchTerm}
            onSubmitEditing={(e) => {
              setTerm(e.nativeEvent.text);
              refetchSearch();
            }}
          />
        </Flex>
        <Flex fill centered width="100%">
          {isFetching ? (
            <Spinner />
          ) : (
            <Flex width={"100%"} height="100%">
              {searchResult ? (
                <FlashList
                  data={searchResult}
                  estimatedItemSize={110}
                  keyExtractor={(item) => String(item.id)}
                  ItemSeparatorComponent={() => <Separator my="$2" />}
                  ListEmptyComponent={() => (
                    <Flex fill centered>
                      <Text>empty :/</Text>
                    </Flex>
                  )}
                  renderItem={({ item }) => {
                    return (
                      <Flex
                        pressStyle={{ opacity: 0.8 }}
                        space={"$2"}
                        onPress={() => selectPodcast(item)}
                        width={"100%"}
                      >
                        <Flex row gap={"$2"}>
                          <FastImage
                            style={{
                              height: 52,
                              width: 52,
                            }}
                            resizeMode="cover"
                            source={{
                              uri: item.cover,
                              priority: "low",
                            }}
                          />
                          <Flex>
                            <Text>{item.artistName}</Text>
                            <Text>{item.trackCount} Episodes</Text>
                          </Flex>
                        </Flex>
                        <Text>{item.title}</Text>
                        <Flex row gap="$2">
                          <Text color="$gray11" fontSize={10}>
                            {item.genres.join(", ")}
                          </Text>
                        </Flex>
                      </Flex>
                    );
                  }}
                />
              ) : null}
            </Flex>
          )}
        </Flex>
      </AnimatedFlex>
      {showSelectFeed ? (
        <AnimatedFlex
          px={"$4"}
          width="100%"
          height="100%"
          bg="$background"
          entering={SlideInRight}
        >
          <Flex row pb="$2">
            <TouchableArea
              flexDirection="row"
              alignItems="center"
              onPress={() => setShowSelectFeed(false)}
            >
              <ChevronLeft />
              <Text>Go back</Text>
            </TouchableArea>
          </Flex>
          {feedIsFetching || feedIsLoading ? (
            <Flex fill centered paddingBottom={headerHeight}>
              <Spinner />
            </Flex>
          ) : null}
          {selectedPodcastFeed &&
          selectedPodcast &&
          !feedIsFetching &&
          !feedIsLoading ? (
            <NewPodcastForm
              selectedPodcastFeed={selectedPodcastFeed}
              selectedPodcast={selectedPodcast}
            />
          ) : null}
        </AnimatedFlex>
      ) : null}
    </Screen>
  );
};

export default AddPage;
