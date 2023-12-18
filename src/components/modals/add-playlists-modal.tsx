import { useMemo, useRef, useState } from "react";
import { ListRenderItem } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button, Spinner, Text } from "tamagui";

import { useAppSafeAreas } from "../../hooks/use-app-safe-areas";
import {
  createPlaylistModalAtom,
  currentLibraryIdAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { PlaylistExpanded } from "../../types/aba";
import { PlaylistCover } from "../covers/playlist-cover";
import {
  AppBottomSheetModal,
  HandleBar,
} from "../custom-components/bottom-sheet-modal";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";
import { TouchableArea } from "../touchable/touchable-area";

type AddPlaylistsModalControllerType = {
  open: boolean;
  libraryItemId?: string;
  episodeId?: string;
};

type SortedPlaylist = PlaylistExpanded & {
  includesItem: boolean;
};

export const AddPlaylistsModalAtom = atom<AddPlaylistsModalControllerType>({
  open: false,
});

const AddPlaylistsModal = () => {
  const [addPlaylistsModalController, setAddPlaylistModalController] = useAtom(
    AddPlaylistsModalAtom
  );
  const setCreatePlaylist = useSetAtom(createPlaylistModalAtom);

  const serverAddress = useAtomValue(serverAddressAtom);
  const userToken = useAtomValue(userTokenAtom);
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const queryClient = useQueryClient();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const { bottom } = useAppSafeAreas();

  const { data: playlists, isLoading } = useQuery({
    queryKey: ["playlists-modal", currentLibraryId],
    queryFn: async () => {
      try {
        const response: { data: { results: PlaylistExpanded[] } } =
          await axios.get(
            `${serverAddress}/api/libraries/${currentLibraryId}/playlists`,
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

        return response.data.results;
      } catch (error) {
        console.log("[PLAYLISTS_PAGE] error ", error);
      }
    },
  });

  const onClose = () => {
    setAddPlaylistModalController({ open: false });
  };

  const removeFromPlaylist = async (id: string) => {
    try {
      const fullUrl = addPlaylistsModalController.episodeId
        ? `/${addPlaylistsModalController.libraryItemId}/${addPlaylistsModalController.episodeId}`
        : `/${addPlaylistsModalController.libraryItemId}`;

      const response = await axios.delete(
        `${serverAddress}/api/playlists/${id}/item${fullUrl}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const newPlaylistLength = response.data.items.length;

      queryClient.setQueryData(
        ["playlists-modal", currentLibraryId],
        (oldData: PlaylistExpanded[] | undefined) => {
          if (oldData) {
            const newData = newPlaylistLength
              ? [...oldData.filter((pl) => pl.id !== id), response.data]
              : [...oldData.filter((pl) => pl.id !== id)];
            return newData;
          } else return oldData;
        }
      );
    } catch (error) {
      console.log("[ADD_PLAYLISTS_MODAL] addToPlaylist error", error);
    }
  };
  const addToPlaylist = async (id: string) => {
    try {
      const response = await axios.post(
        `${serverAddress}/api/playlists/${id}/item`,
        {
          libraryItemId: addPlaylistsModalController.libraryItemId,
          episodeId: addPlaylistsModalController.episodeId
            ? addPlaylistsModalController.episodeId
            : null,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      queryClient.setQueryData(
        ["playlists-modal", currentLibraryId],
        (oldData: PlaylistExpanded[] | undefined) => {
          if (oldData) {
            return [...oldData.filter((pl) => pl.id !== id), response.data];
          } else return oldData;
        }
      );
    } catch (error) {
      console.log("[ADD_PLAYLISTS_MODAL] addToPlaylist error", error);
    }
  };

  if (!addPlaylistsModalController.open) {
    return null;
  }

  const playlistsSorted = useMemo(() => {
    return playlists
      ?.map((playlist) => {
        const includesItem = playlist.items.some((item) =>
          item.libraryItemId === addPlaylistsModalController.libraryItemId &&
          item.episode
            ? playlist.items.some(
                (playlistItem) =>
                  playlistItem.episodeId ===
                    addPlaylistsModalController.episodeId &&
                  playlistItem.libraryItemId ===
                    addPlaylistsModalController.libraryItemId
              )
            : playlist.items.some(
                (playlistItem) =>
                  playlistItem.libraryItemId ===
                  addPlaylistsModalController.libraryItemId
              )
        );

        return {
          includesItem: includesItem,
          ...playlist,
        };
      })
      .sort((a) => (a.includesItem ? -1 : 1));
  }, [playlists, addPlaylistsModalController]);

  const renderItem: ListRenderItem<SortedPlaylist> = ({ item }) => {
    return (
      <PlaylistItem
        item={item}
        serverAddress={serverAddress}
        userToken={userToken ?? ""}
        addToPlaylist={addToPlaylist}
        removeFromPlaylist={removeFromPlaylist}
      />
    );
  };

  return (
    <AppBottomSheetModal
      fullScreen
      hideHandlebar
      renderBehindTopInset
      onClose={onClose}
      ref={bottomSheetRef}
    >
      <Screen edges={["top"]}>
        <HandleBar containerFlexStyles={{ height: 30 }} />

        <FlatList
          showsVerticalScrollIndicator={false}
          data={isLoading ? undefined : playlistsSorted}
          onScroll={(e) => {
            if (e.nativeEvent.contentOffset.y < -180) {
              bottomSheetRef.current?.close();
            }
          }}
          contentContainerStyle={{
            paddingBottom: 44,
            paddingTop: 10,
            flexGrow: 1,
          }}
          ItemSeparatorComponent={() => <Flex h={10} />}
          ListEmptyComponent={
            <Flex fill mx={24} my={12} centered>
              {isLoading ? <Spinner /> : <Text>Empty :/</Text>}
            </Flex>
          }
          keyExtractor={(item) => item.id as string}
          renderItem={renderItem}
        />
        <Flex px="$4" pt="$2" bg="$background" pb={bottom}>
          <Button
            onPress={() =>
              setCreatePlaylist({
                open: true,
                libraryItemId: addPlaylistsModalController.libraryItemId,
                episodeId: addPlaylistsModalController.episodeId,
                libraryId: currentLibraryId ?? "",
              })
            }
          >
            Create Playlist
          </Button>
        </Flex>
      </Screen>
    </AppBottomSheetModal>
  );
};

const PlaylistItem = ({
  item,
  userToken,
  serverAddress,
  addToPlaylist,
  removeFromPlaylist,
}: {
  item: SortedPlaylist;
  userToken: string;
  serverAddress: string;
  addToPlaylist: (id: string) => Promise<void>;
  removeFromPlaylist: (id: string) => Promise<void>;
}) => {
  const coverWidth = 72;
  const [loading, setLoading] = useState(false);

  const addOrRemove = async () => {
    setLoading(true);
    if (item.includesItem) {
      await removeFromPlaylist(item.id);
    } else {
      await addToPlaylist(item.id);
    }
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <Flex pos={"absolute"} width={"100%"} height={"100%"} centered>
          <Spinner />
        </Flex>
      ) : null}
      <Flex
        row
        mx={"$2"}
        bg={item.includesItem ? "$backgroundFocus" : "$backgroundHover"}
        px="$2"
        space="$2"
        opacity={loading ? 0.5 : undefined}
      >
        <Flex w={coverWidth} py="$2" overflow="hidden">
          <PlaylistCover
            item={item}
            serverAddress={serverAddress}
            userToken={userToken ?? ""}
            bookWidth={coverWidth}
          />
        </Flex>
        <Flex row alignItems="center" jc="space-between" fill>
          <Text>{item.name}</Text>
          <TouchableArea
            borderWidth={1}
            borderColor="$color"
            px="$2"
            py="$1"
            borderRadius="$3"
            hapticFeedback
            bg={"$background"}
            onPress={addOrRemove}
          >
            <Text fontSize={14} color={"$gray12"}>
              {item.includesItem ? "remove" : "add"}
            </Text>
          </TouchableArea>
        </Flex>
        {item.includesItem ? (
          <Flex
            bg={"$color"}
            br={"$8"}
            t={0}
            l={0}
            b={0}
            r={0}
            w={"$0.25"}
            pos={"absolute"}
          />
        ) : null}
      </Flex>
    </>
  );
};

export default AddPlaylistsModal;
