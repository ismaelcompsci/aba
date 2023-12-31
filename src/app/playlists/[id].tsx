import { useMemo } from "react";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import { Pause, Play } from "@tamagui/lucide-icons";
import { useIsFetching, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import { Spinner, Text, useTheme } from "tamagui";

import { PlaylistCover } from "../../components/covers/playlist-cover";
import { Modal } from "../../components/custom-components/modal";
import BackHeader from "../../components/layout/back-header";
import { Flex } from "../../components/layout/flex";
import { Screen } from "../../components/layout/screen";
import { Loaders } from "../../components/loader";
import { PlaylistPageMore } from "../../components/menus/playlist-page-more";
import { PlaylistTable } from "../../components/tables/playlist-table";
import { TouchableArea } from "../../components/touchable/touchable-area";
import {
  mediaProgressAtom,
  serverAddressAtom,
  showPlayerAtom,
  userTokenAtom,
} from "../../state/app-state";
import { PlaylistExpanded } from "../../types/aba";

const PlaylistsPage = () => {
  const userToken = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);

  const { name, id } = useLocalSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ["single-playlist", id],
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
    <Screen edges={["top", "left", "right", "bottom"]}>
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
          <Loaders.Main />
        ) : (
          <Flex height="100%" pb="$4" px="$2">
            <Flex shrink>
              <PlaylistPageHeader
                data={data}
                serverAddress={serverAddress}
                userToken={userToken}
                showPlayButon={showPlayButon}
              />
            </Flex>
            <Flex grow>
              <PlaylistTable
                data={data}
                serverAddress={serverAddress}
                userToken={userToken}
              />
            </Flex>
          </Flex>
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

  const mediaProgress = useAtomValue(mediaProgressAtom);

  const colors = useTheme();
  const textColor = colors.color.get();

  const playItem = () => {
    const playableItems = data.items.filter((item) => {
      const { libraryItem, episode } = item;
      if (libraryItem.isMissing || libraryItem.isInvalid) return true;
      if (episode) return episode.audioFile;
      // @ts-ignore
      return libraryItem.media.tracks?.length;
    });

    const firstItemIndex = playableItems.findIndex((v) => {
      const itemProgress = mediaProgress.find((val) => {
        if (v.episodeId && val?.episodeId !== v.episodeId) return false;
        return val?.libraryItemId === v.libraryItemId;
      });

      return !itemProgress?.isFinished && itemProgress?.progress !== 1;
    });

    const firstItem = playableItems[firstItemIndex];
    playableItems.splice(firstItemIndex, 1);

    const playlist = !playableItems.length
      ? undefined
      : [
          ...playableItems.map((item) => ({
            libraryItemId: item.libraryItemId,
            episodeId: item.episodeId ? item.episodeId : undefined,
          })),
        ];

    if (isPlaying) {
      if (showPlayer.playing) {
        TrackPlayer.pause();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: firstItem?.libraryItemId,
          episodeId: firstItem?.episodeId ? firstItem?.episodeId : undefined,
          playlist: playlist,
        });
      }
    } else {
      if (showPlayer.playing) {
        TrackPlayer.play();
      } else {
        setShowPlayer({
          open: true,
          playing: true,
          libraryItemId: firstItem?.libraryItemId,
          episodeId: firstItem?.episodeId ? firstItem?.episodeId : undefined,
          playlist: playlist,
        });
      }
    }
  };

  const isPlaylistPlaying = useMemo(
    () =>
      data.items.find((item) => {
        if (item.episodeId && item.episodeId !== showPlayer.episodeId)
          return false;

        return showPlayer.libraryItemId === item.libraryItemId;
      }),
    [showPlayer, data]
  );

  return (
    <Flex minHeight={playlistPictureSize + 82} space>
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
          maxHeight={"$4"}
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

export default PlaylistsPage;
