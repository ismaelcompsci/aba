import { useState } from "react";
import { Keyboard } from "react-native";
import FastImage from "react-native-fast-image";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import * as Burnt from "burnt";
import { router } from "expo-router";
import { useAtomValue } from "jotai";
import { Button, Label, Switch, TextArea } from "tamagui";

import {
  currentLibraryAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../../state/app-state";
import { LibraryItemExpanded, PodcastFeed } from "../../../types/aba";
import { PodcastSearch } from "../../../types/types";
import { sanitizeFilename } from "../../../utils/utils";
import { InputWithTags } from "../../custom-components/input-with-tags";
import { VirtualizedList } from "../../custom-components/virtual-scroll-view";
import { Flex } from "../../layout/flex";

import { PodcastFormFolderMenu } from "./podcast-form-folder-menu";
import { PodcastFormInput, PodcastFormTextInput } from "./podcast-form-inputs";

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

type NewPodcastPayload = {
  path: string;
  folderId: string;
  libraryId: string;
  media: {
    metadata: Omit<Podcast, "autoDownloadEpisodes">;
  };
  autoDownloadEpisodes: boolean;
};

export const NewPodcastForm = ({
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
  const userToken = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);

  const [tags, setTags] = useState<string[]>(podcast.genres);

  const [selectedFolderItem, setSelectedFolderItem] = useState(
    libraryFolderItems[0] ? libraryFolderItems[0] : undefined
  );

  const fullPath =
    selectedFolderItem && podcast.title
      ? selectedFolderItem.fullPath + "/" + sanitizeFilename(podcast.title)
      : "";

  const { mutate: addPodcast } = useMutation({
    mutationFn: async (payload: NewPodcastPayload) => {
      const response: { data: LibraryItemExpanded } = await axios.post(
        `${serverAddress}/api/podcasts`,
        payload,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const libraryItem = response.data;
      router.push(`/book/${libraryItem.id}`);
    },
  });

  const onSubmit = async () => {
    if (!selectedFolderItem || !library) return;

    const payload: NewPodcastPayload = {
      path: fullPath,
      folderId: selectedFolderItem.id,
      libraryId: library.id,
      media: {
        metadata: {
          title: podcast.title,
          author: podcast.author,
          description: podcast.description,
          releaseDate: podcast.releaseDate,
          genres: [...podcast.genres],
          feedUrl: podcast.feedUrl,
          imageUrl: podcast.imageUrl,
          itunesPageUrl: podcast.itunesPageUrl,
          itunesId: podcast.itunesId,
          itunesArtistId: podcast.itunesArtistId,
          language: podcast.language,
        },
      },
      autoDownloadEpisodes: podcast.autoDownloadEpisodes,
    };

    addPodcast(payload, {
      onError: () => {
        Burnt.toast({
          title: "Failed to add podcast",
          preset: "error",
        });
      },
    });
  };

  return (
    <VirtualizedList
      contentContainerStyle={{ paddingBottom: 44 }}
      automaticallyAdjustKeyboardInsets
    >
      <Flex fill space onPress={() => Keyboard.dismiss()}>
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
        <PodcastFormTextInput
          label={"Title"}
          defaultValue={podcast.title}
          onEndEditing={(e) =>
            setPodcast({ ...podcast, title: e.nativeEvent.text })
          }
        />
        <PodcastFormTextInput
          label={"Author"}
          defaultValue={podcast.author}
          onEndEditing={(e) =>
            setPodcast({ ...podcast, author: e.nativeEvent.text })
          }
        />
        <PodcastFormTextInput
          label={"Feed URL"}
          defaultValue={podcast.feedUrl}
          disabled
          locked
        />
        <PodcastFormInput label="Genres">
          <InputWithTags tags={tags} setTags={setTags} />
        </PodcastFormInput>
        <PodcastFormInput label="Description">
          <TextArea
            defaultValue={podcast.description}
            onEndEditing={(e) =>
              setPodcast({ ...podcast, description: e.nativeEvent.text })
            }
          />
        </PodcastFormInput>
        <PodcastFormFolderMenu
          libraryFolderItems={libraryFolderItems}
          selectedFolderItem={selectedFolderItem}
          setSelectedFolderItem={setSelectedFolderItem}
        />
        <PodcastFormTextInput
          label={"Podcast Path"}
          disabled
          locked
          defaultValue={fullPath}
        />
        <Flex row alignItems="center" space="$2" justifyContent="space-between">
          <Label paddingRight="$0" minWidth={90} justifyContent="flex-end">
            Auto Download Episodes
          </Label>
          <Switch
            native
            checked={podcast.autoDownloadEpisodes}
            onCheckedChange={(checked) =>
              setPodcast({ ...podcast, autoDownloadEpisodes: checked })
            }
          >
            <Switch.Thumb></Switch.Thumb>
          </Switch>
        </Flex>
        <Flex row alignItems="center" space="$2">
          <Button flex={1} onPress={onSubmit}>
            Submit
          </Button>
        </Flex>
      </Flex>
    </VirtualizedList>
  );
};
