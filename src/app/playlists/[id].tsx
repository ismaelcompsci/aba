import { useMemo } from "react";
import { Alert, FlatList } from "react-native";
import FastImage from "react-native-fast-image";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { MoreVertical, Pause, Play } from "@tamagui/lucide-icons";
import { useIsFetching, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { Spinner, Text, useTheme } from "tamagui";
import * as DropdownMenu from "zeego/dropdown-menu";

import { PlaylistCover } from "../../components/covers/playlist-cover";
import { Modal } from "../../components/custom-components/modal";
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
    queryKey: ["playlists-page", id],
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

  const showPlayButon = useMemo(
    () =>
      Boolean(
        data?.items.filter((item) => {
          const libraryItem = item.libraryItem;
          if (libraryItem.isMissing || libraryItem.isInvalid) return false;
          if (item.episode) return item.episode.audioFile;
          // @ts-ignore
          return libraryItem.media.tracks.length;
        }).length
      ),
    [id, data]
  );

  return (
    <Screen edges={["top", "left", "right"]}>
      <BackHeader
        endAdornment={
          userToken ? (
            <PlaylistPageMore
              name={name as string}
              playlistId={id as string}
              serverAddress={serverAddress}
              userToken={userToken}
            />
          ) : undefined
        }
        alignment="center"
        mx={16}
        py={18}
      >
        <Text fontSize={18}>{name}</Text>
      </BackHeader>
      <PageLoading />
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
                showPlayButon={showPlayButon}
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

const PageLoading = () => {
  const isFetchingPlaylists = useIsFetching({ queryKey: ["playlists"] });
  if (!isFetchingPlaylists) return null;

  return (
    <Modal
      visible={Boolean(isFetchingPlaylists)}
      transparent={true}
      dimBackground
    >
      <Flex padding="$4" centered>
        <Flex space>
          <Spinner />
          <Text>Deleting playlists...</Text>
        </Flex>
      </Flex>
    </Modal>
  );
};

const PlaylistPageMore = ({
  userToken,
  serverAddress,
  playlistId,
  name,
}: {
  userToken: string;
  serverAddress: string;
  playlistId: string;
  name: string;
}) => {
  const queryClient = useQueryClient();

  const deletePlaylist = async () => {
    try {
      await axios.delete(`${serverAddress}/api/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      await queryClient.invalidateQueries(["playlists"]);

      router.back();
    } catch (error) {
      console.log("[PLAYLISTPAGEMORE] deletePlaylist error", error);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <TouchableArea>
          <MoreVertical />
        </TouchableArea>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          destructive
          key="mark_as_finshed"
          onSelect={() =>
            Alert.alert(
              "Delete Playlist",
              `Are you sure you want to delete playlist ${name}`,

              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Okay",
                  style: "destructive",
                  onPress: async () => await deletePlaylist(),
                },
              ],
              {
                cancelable: true,
              }
            )
          }
        >
          <DropdownMenu.ItemTitle>Delete playlist</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemIcon ios={{ name: "trash" }} />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

const PlaylistPageHeader = ({
  data,
  serverAddress,
  userToken,
  showPlayButon,
}: {
  data: PlaylistExpanded;
  serverAddress: string;
  userToken: string;
  showPlayButon: boolean;
}) => {
  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);
  const playlistPictureSize = 216;

  const colors = useTheme();
  const textColor = colors.color.get();

  const playItem = () => {
    const firstItem = data.items[0];

    if (isPlaying) {
      if (showPlayer.playing) {
        TrackPlayer.pause();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: firstItem.libraryItemId,
          episodeId: firstItem.episodeId ? firstItem.episodeId : undefined,
        });
      }
    } else {
      if (showPlayer.playing) {
        TrackPlayer.play();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: firstItem.libraryItemId,
          episodeId: firstItem.episodeId ? firstItem.episodeId : undefined,
        });
      }
    }
  };

  const isPlaylistPlaying = useMemo(
    () =>
      data.items.find(
        (item) =>
          item.libraryItemId === showPlayer.libraryItemId &&
          item.episodeId === showPlayer.episodeId
      ),
    [showPlayer, data]
  );

  return (
    <Flex space>
      <Flex centered>
        <Flex height={playlistPictureSize} width={playlistPictureSize}>
          <PlaylistCover
            item={data}
            bookWidth={playlistPictureSize}
            serverAddress={serverAddress}
            userToken={userToken}
          />
        </Flex>
      </Flex>
      {showPlayButon ? (
        <TouchableArea
          theme="blue"
          bg="$blue7"
          borderRadius={"$4"}
          flexDirection="row"
          alignItems="center"
          jc={"center"}
          px={"$9"}
          flex={1}
          minHeight={"$4"}
          gap={"$2"}
          onPress={playItem}
        >
          {isPlaying && isPlaylistPlaying ? (
            <>
              <Pause color={textColor} />
              <Text color={textColor}>Pause</Text>
            </>
          ) : (
            <>
              <Play size="$1" color={textColor} />
              <Text color={textColor}>Play</Text>
            </>
          )}
        </TouchableArea>
      ) : null}
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
    <Flex bg="$backgroundHover" px="$2" borderRadius={"$4"} pb={"$4"}>
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
      <Flex bg="$backgroundHover" fill borderRadius="$4" px="$1">
        <FlatList
          data={data.items}
          keyExtractor={(playlistItem, i) =>
            playlistItem.episodeId
              ? playlistItem.episodeId + String(i)
              : playlistItem.libraryItemId + String(i)
          }
          ItemSeparatorComponent={() => <Flex h={16} />}
          renderItem={({ item }) => (
            <PlaylistItemRow
              playlistItem={item}
              serverAddress={serverAddress}
              userToken={userToken}
            />
          )}
        />
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

  const tracks = playlistItem.episode
    ? []
    : // @ts-ignore
      playlistItem.libraryItem.media.tracks;
  const isMissing = playlistItem.libraryItem.isMissing;
  const isInvalid = playlistItem.libraryItem.isInvalid;

  const showPlayButton =
    !isMissing && !isInvalid && (tracks.length || playlistItem.episode);

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
          {showPlayButton ? (
            <Text fontSize={12} numberOfLines={1} color={"$gray11"}>
              {elapsedTime(duration)}
            </Text>
          ) : null}
        </Flex>
        <Flex grow />
        {showPlayButton ? (
          <PlayButton
            id={playlistItem.libraryItemId}
            episodeId={playlistItem.episodeId}
          />
        ) : null}
        <BookMoreMenu
          itemId={playlistItem.libraryItemId}
          episodeId={
            playlistItem.episodeId ? playlistItem.episodeId : undefined
          }
          hasTracks={Boolean(tracks.length)}
          vertical
        />
      </Flex>
    </TouchableArea>
  );
};

const PlayButton = ({
  id,
  episodeId,
}: {
  id: string;
  episodeId?: string | null;
}) => {
  const playerState = usePlaybackState();
  const isPlaying = playerState.state === State.Playing;
  const [showPlayer, setShowPlayer] = useAtom(showPlayerAtom);

  const colors = useTheme();
  const textColor = colors.color.get();

  const episodePlaying = episodeId ? episodeId === showPlayer.episodeId : true;

  const playItem = () => {
    if (isPlaying) {
      if (
        showPlayer.playing &&
        showPlayer.libraryItemId === id &&
        showPlayer.episodeId === episodeId
      ) {
        TrackPlayer.pause();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: id,
          episodeId: episodeId ? episodeId : undefined,
        });
      }
    } else {
      if (
        showPlayer.playing &&
        showPlayer.libraryItemId === id &&
        showPlayer.episodeId === episodeId
      ) {
        TrackPlayer.play();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: id,
          episodeId: episodeId ? episodeId : undefined,
        });
      }
    }
  };

  return (
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
      onPress={playItem}
    >
      <Flex ai={"center"} jc={"center"} pos={"absolute"} right={"$2"}>
        {isPlaying && showPlayer.libraryItemId === id && episodePlaying ? (
          <Pause color={textColor} />
        ) : (
          <Play size="$1" color={textColor} />
        )}
      </Flex>
    </TouchableArea>
  );
};

export default PlaylistsPage;
