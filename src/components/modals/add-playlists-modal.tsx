import { useMemo } from "react";
import { ListRenderItem } from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";
import { Button, Spinner, Text } from "tamagui";

import {
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

  const serverAddress = useAtomValue(serverAddressAtom);
  const userToken = useAtomValue(userTokenAtom);
  const currentLibraryId = useAtomValue(currentLibraryIdAtom);
  const queryClient = useQueryClient();

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

  const removeFromPlaylist = async () => {};
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
      .sort((a, b) => (a.includesItem ? -1 : 1));
  }, [playlists, addPlaylistsModalController]);

  const renderItem: ListRenderItem<SortedPlaylist> = ({ item, index }) => {
    return (
      <PlaylistItem
        item={item}
        serverAddress={serverAddress}
        userToken={userToken ?? ""}
        addToPlaylist={addToPlaylist}
      />
    );
  };

  return (
    <AppBottomSheetModal
      fullScreen
      hideHandlebar
      renderBehindTopInset
      onClose={onClose}
    >
      <Screen edges={["top"]}>
        <HandleBar />

        <BottomSheetFlatList
          data={isLoading ? undefined : playlistsSorted}
          contentContainerStyle={{
            paddingBottom: 44,
            paddingTop: 10,
          }}
          ItemSeparatorComponent={() => <Flex h={10} />}
          ListEmptyComponent={
            <Flex fill mx={24} my={12} centered>
              <Spinner />
            </Flex>
          }
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </Screen>
    </AppBottomSheetModal>
  );
};

const PlaylistItem = ({
  item,
  userToken,
  serverAddress,
  addToPlaylist,
}: {
  item: SortedPlaylist;
  userToken: string;
  serverAddress: string;
  addToPlaylist: (id: string) => void;
}) => {
  const coverWidth = 72;

  return (
    <Flex
      row
      mx={"$2"}
      bg={item.includesItem ? "$backgroundFocus" : "$backgroundHover"}
      px="$2"
      space="$2"
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
          onPress={() => {
            if (item.includesItem) return;
            else addToPlaylist(item.id);
          }}
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
  );
};

export default AddPlaylistsModal;
