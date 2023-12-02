import { useState } from "react";
import { FlatList } from "react-native";
import FastImage from "react-native-fast-image";
import { ChevronLeft, Rss } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as Burnt from "burnt";
import { Input, Separator, Text } from "tamagui";

import { PodcastFeed } from "../../types/aba";
import { PodcastSearch } from "../../types/types";
import InputWithIcon from "../custom-components/input-with-icon";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { TouchableArea } from "../touchable/touchable-area";

interface AddPageProps {
  serverAddress: string;
  userToken: string;
}

const AddPage = ({ serverAddress, userToken }: AddPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelectFeed, setShowSelectFeed] = useState(false);
  const [selectedPodcastFeed, setSelectedPodcastFeed] = useState<
    PodcastFeed | undefined
  >(undefined);

  const {
    data: searchResult,
    refetch,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["podcast-search", searchTerm],
    queryFn: async () => {
      const response: { data: PodcastSearch[] } = await axios.get(
        `${serverAddress}/api/search/podcast`,
        {
          params: {
            term: encodeURIComponent(searchTerm),
          },
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      return response.data;
    },
    enabled: false,
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

    try {
      const response: { data: { podcast: PodcastFeed } } = await axios.post(
        `${serverAddress}/api/podcasts/feed`,
        { rssFeed: item.feedUrl },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      setSelectedPodcastFeed(response.data.podcast);
      setShowSelectFeed(true);
    } catch (error) {
      Burnt.toast({
        title: "Failed to get Podcast feed",
        preset: "error",
      });
    }
  };

  return (
    <Screen px={"$4"} pt={"$2"}>
      {!showSelectFeed ? (
        <>
          <Flex pb={"$4"}>
            <InputWithIcon
              icon={Rss}
              onChangeText={setSearchTerm}
              onSubmitEditing={() => refetch()}
            />
          </Flex>
          <Flex fill>
            <FlatList
              data={searchResult}
              keyExtractor={(item) => String(item.id)}
              ItemSeparatorComponent={() => <Separator my="$2" />}
              renderItem={({ item }) => {
                return (
                  <Flex
                    pressStyle={{ opacity: 0.8 }}
                    space={"$2"}
                    onPress={() => selectPodcast(item)}
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
                        }}
                      />
                      <Flex>
                        <Text>{item.artistName}</Text>
                        <Text>{item.trackCount} Episodes</Text>
                      </Flex>
                    </Flex>
                    <Text>{item.title}</Text>
                    <Flex row gap="$2">
                      {item.genres.length &&
                        item.genres.map((genre, i) => (
                          <Text color="$gray11" fontSize={10} key={i}>
                            {genre},
                          </Text>
                        ))}
                    </Flex>
                  </Flex>
                );
              }}
            />
          </Flex>
        </>
      ) : (
        <Flex fill>
          <Flex row>
            <TouchableArea
              flexDirection="row"
              alignItems="center"
              onPress={() => setShowSelectFeed(false)}
            >
              <ChevronLeft />
              <Text>Go back</Text>
            </TouchableArea>
          </Flex>
          {selectedPodcastFeed ? (
            <NewPodcastForm selectedPodcastFeed={selectedPodcastFeed} />
          ) : null}
        </Flex>
      )}
    </Screen>
  );
};

const NewPodcastForm = ({
  selectedPodcastFeed,
}: {
  selectedPodcastFeed: PodcastFeed;
}) => {
  return (
    <Flex fill>
      <Flex pt="$6">
        <FastImage
          style={{
            width: "100%",
            height: 142,
          }}
          resizeMode="contain"
          source={{
            uri: selectedPodcastFeed?.metadata.image,
          }}
        />
      </Flex>
      {/* form */}
      <PodcastFormInput
        label={"Title"}
        value={selectedPodcastFeed.metadata.title}
      />
    </Flex>
  );
};

const PodcastFormInput = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <Flex gap="$1">
      <Text fontSize={16} fontWeight={"900"}>
        {label}
      </Text>
      <Input value={value} />
    </Flex>
  );
};

export default AddPage;
