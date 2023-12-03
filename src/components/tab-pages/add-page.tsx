import { useState } from "react";
import { useWindowDimensions } from "react-native";
import FastImage from "react-native-fast-image";
import {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { ChevronDown, ChevronLeft, Rss } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as Burnt from "burnt";
import { useAtomValue } from "jotai";
import {
  Button,
  Input,
  InputProps,
  Popover,
  Separator,
  Spinner,
  Text,
  TextArea,
} from "tamagui";

import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import { currentLibraryAtom } from "../../state/app-state";
import { Folder, PodcastFeed } from "../../types/aba";
import { PodcastSearch } from "../../types/types";
import { sanitizeFilename } from "../../utils/utils";
import InputWithIcon from "../custom-components/input-with-icon";
import { VirtualizedList } from "../custom-components/virtual-scroll-view";
import { AnimatedFlex, Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { TouchableArea } from "../touchable/touchable-area";

interface AddPageProps {
  serverAddress: string;
  userToken: string;
}

const AddPage = ({ serverAddress, userToken }: AddPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
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
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["podcast-search", searchTerm],
    queryFn: async () => {
      try {
        if (!searchTerm) return;

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
      } catch (error) {
        console.log("[ADD_PAGE] error ", error);
      }
    },
    enabled: false,
    staleTime: 0,
  });

  const { isLoading: feedIsLoading, isFetching: feedIsFetching } = useQuery({
    queryKey: ["podcast-feed", feedUrl],
    queryFn: async () => {
      try {
        if (!feedUrl) return;
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

  return (
    <Screen>
      {/* {!showSelectFeed ? ( */}
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
            onSubmitEditing={() => refetchSearch()}
          />
        </Flex>
        <Flex fill centered width="100%">
          {(isLoading || isFetching) && searchResult ? (
            <Spinner />
          ) : (
            <Flex width={"100%"} height="100%">
              <FlashList
                data={searchResult}
                estimatedItemSize={110}
                keyExtractor={(item) => String(item.id)}
                ItemSeparatorComponent={() => <Separator my="$2" />}
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
            </Flex>
          )}
        </Flex>
      </AnimatedFlex>
      {/* ) : null} */}
      {showSelectFeed ? (
        <AnimatedFlex
          px={"$4"}
          // pt="$2"
          pos={"absolute"}
          width="100%"
          height="100%"
          bg="$background"
          entering={SlideInRight}
          // exiting={SlideOutRight}
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

type Podcast = {
  title: string;
  author: string;
  description: string;
  releaseDate: string;
  genres: string[];
  feedUrl: string;
  imageUrl: string;
  itunesPageUrl: string;
  itunesId?: number;
  itunesArtistId?: number;
  language?: string;
  autoDownloadEpisodes: boolean;
};

const NewPodcastForm = ({
  selectedPodcastFeed,
  selectedPodcast,
}: {
  selectedPodcastFeed: PodcastFeed;
  selectedPodcast: PodcastSearch;
}) => {
  const [podcast, setPodcast] = useState<Podcast>({
    title: selectedPodcast.title || selectedPodcastFeed.metadata.title || "",
    author:
      selectedPodcast.artistName || selectedPodcastFeed.metadata.author || "",
    description:
      selectedPodcast.description ||
      selectedPodcastFeed.metadata.descriptionPlain ||
      "",
    releaseDate: selectedPodcast.releaseDate || "",
    genres:
      selectedPodcast.genres || selectedPodcastFeed.metadata.categories || [],
    feedUrl:
      selectedPodcast.feedUrl || selectedPodcastFeed.metadata.feedUrl || "",
    imageUrl: selectedPodcast.cover || selectedPodcastFeed.metadata.image || "",
    itunesPageUrl: selectedPodcast.pageUrl || "",
    itunesId: selectedPodcast.id,
    itunesArtistId: selectedPodcast.artistId,
    language: selectedPodcast.language || "",
    autoDownloadEpisodes: false,
  });
  const library = useAtomValue(currentLibraryAtom);
  const libraryFolderItems = library?.folders || [];

  const [selectedFolderItem, setSelectedFolderItem] = useState(
    libraryFolderItems[0] ? libraryFolderItems[0] : undefined
  );

  const fullPath =
    selectedFolderItem && podcast.title
      ? selectedFolderItem.fullPath + "/" + sanitizeFilename(podcast.title)
      : "";

  return (
    <VirtualizedList contentContainerStyle={{ paddingBottom: 44 }}>
      <Flex fill space>
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
          defaultValue={podcast.title}
          onEndEditing={(e) =>
            setPodcast({ ...podcast, title: e.nativeEvent.text })
          }
        />
        <PodcastFormInput
          label={"Author"}
          defaultValue={podcast.author}
          onEndEditing={(e) =>
            setPodcast({ ...podcast, author: e.nativeEvent.text })
          }
        />
        <PodcastFormInput
          label={"Feed URL"}
          defaultValue={podcast.feedUrl}
          disabled
        />
        <PodcastFormInput
          label={"Genres"}
          defaultValue={podcast.genres.join(", ")}
          // onEndEditing={(e) =>
          //   setPodcast({ ...podcast, genres: e.nativeEvent.text })
          // }
        />
        <Flex gap="$1">
          <Text fontSize={16} fontWeight={"900"}>
            Description
          </Text>
          <TextArea
            defaultValue={podcast.description}
            onEndEditing={(e) =>
              setPodcast({ ...podcast, description: e.nativeEvent.text })
            }
          />
        </Flex>
        <PodcastFormFolderMenu
          libraryFolderItems={libraryFolderItems}
          selectedFolderItem={selectedFolderItem}
          setSelectedFolderItem={setSelectedFolderItem}
        />
        <PodcastFormInput
          label={"Podcast Path"}
          disabled
          defaultValue={fullPath}
        />
        <Button>Submit</Button>
      </Flex>
    </VirtualizedList>
  );
};

const PodcastFormFolderMenu = ({
  selectedFolderItem,
  setSelectedFolderItem,
  libraryFolderItems,
}: {
  libraryFolderItems: Folder[];
  selectedFolderItem?: Folder;
  setSelectedFolderItem: (folder: Folder) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { width } = useWindowDimensions();

  return (
    <Flex gap="$1">
      <Text fontSize={16} fontWeight={"900"}>
        Folder
      </Text>
      <Popover
        open={open}
        onOpenChange={setOpen}
        placement="bottom"
        allowFlip
        offset={{
          mainAxis: 5,
        }}
      >
        <Popover.Trigger asChild>
          <Button bg="$gray2" justifyContent="space-between">
            {selectedFolderItem?.fullPath}
            <ChevronDown />
          </Button>
        </Popover.Trigger>
        <Popover.Content
          width="100%"
          bg="$gray2"
          borderWidth={1}
          borderColor="$borderColor"
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
          elevate
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
        >
          <Flex width={width - 44 * 2}>
            {libraryFolderItems?.map((folder) => (
              <TouchableArea
                key={folder.id}
                py="$2"
                onPress={() => {
                  setSelectedFolderItem(folder);
                  setOpen(false);
                }}
              >
                <Text>{folder.fullPath}</Text>
              </TouchableArea>
            ))}
          </Flex>
        </Popover.Content>
      </Popover>
    </Flex>
  );
};

const PodcastFormInput = ({
  label,
  ...rest
}: {
  label: string;
} & InputProps) => {
  return (
    <Flex gap="$1" {...(rest.disabled && { opacity: 0.7 })}>
      <Text fontSize={16} fontWeight={"900"}>
        {label}
      </Text>
      <Input {...rest} />
    </Flex>
  );
};

export default AddPage;
