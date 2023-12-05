import FastImage from "react-native-fast-image";
import { Play } from "@tamagui/lucide-icons";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { Button, Spinner, Text } from "tamagui";

import { PlaylistCover } from "../../components/covers/playlist-cover";
import { VirtualizedList } from "../../components/custom-components/virtual-scroll-view";
import ItemProgress from "../../components/item-progress";
import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import BookMoreMenu from "../../components/menus/book-more-menu";
import { TouchableArea } from "../../components/touchable/touchable-area";
import {
  serverAddressAtom,
  showPlayerAtom,
  userTokenAtom,
} from "../../state/app-state";
import { PlaylistExpanded, PlaylistItemExpanded } from "../../types/aba";
import { getItemCoverSrc } from "../../utils/api";
import { elapsedTime } from "../../utils/utils";

const PlaylistsPage = () => {
  const userToken = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);

  const { name, id } = useLocalSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["playlists-page"],
    queryFn: async () => {
      const response: { data: PlaylistExpanded } = await axios.get(
        `${serverAddress}/api/playlists/${id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      return response.data;
    },
  });

  return (
    <Screen edges={["top"]}>
      <BackHeader alignment="center" mx={16} py={16}>
        <Text fontSize={18}>{name}</Text>
      </BackHeader>
      <Flex fill>
        {isLoading || !data || !userToken ? (
          <Spinner />
        ) : (
          <VirtualizedList contentContainerStyle={{ paddingBottom: 44 }}>
            <Flex fill p="$4" space>
              <PlaylistPageHeader
                data={data}
                serverAddress={serverAddress}
                userToken={userToken}
              />
              <PlaylistTable
                data={data}
                serverAddress={serverAddress}
                userToken={userToken}
              />
            </Flex>
          </VirtualizedList>
        )}
      </Flex>
    </Screen>
  );
};

const PlaylistPageHeader = ({
  data,
  serverAddress,
  userToken,
}: {
  data: PlaylistExpanded;
  serverAddress: string;
  userToken: string;
}) => {
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const playlistPictureSize = 216;

  const playItem = () => {
    const firstItem = data.items[0];

    if (firstItem.episode && firstItem.episodeId) {
      setShowPlayer({
        playing: true,
        episodeId: firstItem.episodeId,
        libraryItemId: firstItem.libraryItemId,
      });
    } else {
      setShowPlayer({
        playing: true,
        libraryItemId: firstItem.libraryItemId,
      });
    }
  };

  return (
    <Flex space>
      <Flex centered>
        <Flex
          height={playlistPictureSize}
          width={playlistPictureSize}
          bg="blue"
        >
          <PlaylistCover
            item={data}
            bookWidth={playlistPictureSize}
            serverAddress={serverAddress}
            userToken={userToken}
          />
        </Flex>
      </Flex>
      <Button theme="blue" bg="$blue7" onPress={playItem}>
        <Play />
        Play
      </Button>
    </Flex>
  );
};

const PlaylistTable = ({
  data,
  userToken,
  serverAddress,
}: {
  data: PlaylistExpanded;
  userToken: string;
  serverAddress: string;
}) => {
  return (
    <Flex bg="$backgroundHover" px="$2" borderRadius={"$4"}>
      <Flex justifyContent="space-between" row alignItems="center" py="$4">
        <Text fontSize={24} $gtMd={{ fontSize: 34 }}>
          {data.name}
        </Text>
        <Flex p="$2" borderRadius={"$10"} bg={"$backgroundFocus"}>
          <Text
            $gtMd={{
              fontSize: 18,
            }}
          >
            {data.items.length}
          </Text>
        </Flex>
      </Flex>
      <Flex bg="$backgroundHover" fill space borderRadius="$4" px="$1">
        {data.items.map((playlistItem, i) => {
          const key = playlistItem.episodeId
            ? playlistItem.episodeId + String(i)
            : playlistItem.libraryItemId + String(i);

          return (
            <PlaylistItemRow
              key={key}
              playlistItem={playlistItem}
              serverAddress={serverAddress}
              userToken={userToken}
            />
          );
        })}
      </Flex>
    </Flex>
  );
};

const PlaylistItemRow = ({
  playlistItem,
  userToken,
  serverAddress,
}: {
  playlistItem: PlaylistItemExpanded;
  userToken: string;
  serverAddress: string;
}) => {
  const itemCoverSize = 64;

  const coverUrl = getItemCoverSrc(
    playlistItem.libraryItem,
    null,
    userToken,
    serverAddress
  );

  const episode = playlistItem.episode;

  const itemTitle = playlistItem.episode
    ? playlistItem.episode.title
    : playlistItem.libraryItem.media.metadata.title || "";

  const itemAuthor = episode
    ? // @ts-ignore
      playlistItem.libraryItem.media.metadata.author
    : "";

  const duration = episode
    ? playlistItem.episode?.duration
    : // @ts-ignore
      playlistItem.libraryItem.media.duration;

  return (
    <TouchableArea
      borderRadius={"$4"}
      bg={"$backgroundFocus"}
      onPress={() =>
        episode
          ? router.push(
              `/book/${playlistItem.libraryItemId}/${playlistItem.episodeId}`
            )
          : router.push(`/book/${playlistItem.libraryItemId}`)
      }
    >
      <Flex row padding={"$2"} alignItems="center" gap="$2.5">
        {coverUrl ? (
          <FastImage
            resizeMode="cover"
            style={{
              width: itemCoverSize,
              height: itemCoverSize,
              borderRadius: 4,
            }}
            source={{
              uri: coverUrl,
            }}
          />
        ) : null}
        <Flex pos={"absolute"} top={0} left={itemCoverSize - 9}>
          <ItemProgress
            id={playlistItem.libraryItemId}
            episodeId={
              playlistItem.episodeId ? playlistItem.episodeId : undefined
            }
            radius={12}
            activeStrokeWidth={3}
            inActiveStrokeWidth={4}
            circleBackgroundColor="black"
          />
        </Flex>
        <Flex space="$1" maxWidth={"50%"}>
          <Text fontSize={16} numberOfLines={1}>
            {itemTitle}
          </Text>
          <Text fontSize={14} numberOfLines={1}>
            {itemAuthor}
          </Text>
          <Text fontSize={12} numberOfLines={1} color={"$gray11"}>
            {elapsedTime(duration)}
          </Text>
        </Flex>
        <Flex grow />
        <TouchableArea
          borderColor={"$blue7"}
          borderRadius={"$8"}
          borderWidth={1}
          jc={"center"}
          alignItems="center"
          p="$2.5"
          width={"$3.5"}
          height={"$3.5"}
          flexDirection="row"
        >
          <Flex ai={"center"} jc={"center"} pos={"absolute"} right={"$2"}>
            <Play size="$1" />
          </Flex>
        </TouchableArea>
        <BookMoreMenu
          itemId={playlistItem.libraryItemId}
          episodeId={
            playlistItem.episodeId ? playlistItem.episodeId : undefined
          }
          vertical
        />
      </Flex>
    </TouchableArea>
  );
};

export default PlaylistsPage;
