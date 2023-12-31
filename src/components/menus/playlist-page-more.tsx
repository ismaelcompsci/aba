import { Alert } from "react-native";
import { MoreVertical } from "@tamagui/lucide-icons";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { router } from "expo-router";
import * as DropdownMenu from "zeego/dropdown-menu";

import { LibraryPlaylistsResponse } from "../../types/types";
import { TouchableArea } from "../touchable/touchable-area";

export const PlaylistPageMore = ({
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

      const playlistPageData: LibraryPlaylistsResponse | undefined =
        queryClient.getQueryData(["playlists-page"]);

      if (playlistPageData?.results.length === 1 || !playlistPageData) {
        await queryClient.invalidateQueries(["has-playlists"]);
      } else await queryClient.invalidateQueries(["playlists-page"]);
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
