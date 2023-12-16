/* eslint-disable react/prop-types */
import { Alert } from "react-native";
import { MoreHorizontal, MoreVertical } from "@tamagui/lucide-icons";
import axios from "axios";
import * as Burnt from "burnt";
import { useAtomValue, useSetAtom } from "jotai";
import * as DropdownMenu from "zeego/dropdown-menu";

import { useUserMediaProgress } from "../../hooks/use-user-media-progress";
import { serverAddressAtom, userTokenAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { cleanString } from "../../utils/utils";
import { AddPlaylistsModalAtom } from "../modals/add-playlists-modal";
import { TouchableArea } from "../touchable/touchable-area";

function BookMoreMenu({
  title,
  itemId,
  episodeId,
  vertical,
  isPodcast,
}: {
  title?: string | null;
  itemId: string;
  episodeId?: string;
  vertical?: boolean;
  isPodcast?: boolean;
}) {
  const { userProgressPercent, userMediaProgress } = useUserMediaProgress({
    libraryItemId: itemId,
    episodeId,
  });
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const setAddPlaylistModalController = useSetAtom(AddPlaylistsModalAtom);
  const token = useAtomValue(userTokenAtom);
  const serverAddress = useAtomValue(serverAddressAtom);

  const markAsFinshed = async () => {
    try {
      const markAsFinshed = true;
      const data = {
        isFinished: markAsFinshed,
      };

      const route = episodeId
        ? `${serverAddress}/api/me/progress/${itemId}/${episodeId}`
        : `${serverAddress}/api/me/progress/${itemId}`;

      await axios.patch(route, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.log("[APPDIALOG] mark as finshed error", error);
    } finally {
      Burnt.toast({
        title: "Success",
        message: "marked book as finshed",
        preset: "done",
      });
    }
  };

  const clearProgress = async () => {
    try {
      await axios.delete(
        `${serverAddress}/api/me/progress/${userMediaProgress?.id}`,
        {
          headers: {
            Authorization: `Bearer ${serverConfig?.token}`,
          },
        }
      );
    } catch (error) {
      console.log("[APPDIALOG] clear progress error", error);
    } finally {
      Burnt.toast({
        title: "Success",
        message: "reset progress for book",
        preset: "done",
      });
    }
  };

  const addPlaylist = () => {
    setAddPlaylistModalController({
      open: true,
      libraryItemId: itemId,
      episodeId: episodeId,
    });
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <TouchableArea hapticFeedback onPress={() => {}} px="$2">
          {vertical ? <MoreVertical /> : <MoreHorizontal />}
        </TouchableArea>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Book Actions</DropdownMenu.Label>
        {!userMediaProgress?.isFinished ? (
          <DropdownMenu.Item
            key="mark_as_finshed"
            onSelect={() =>
              Alert.alert(
                "Mark as Finshed",
                `Are you sure you want to mark ${cleanString(
                  title ? title : "this book",
                  35
                )} as finshed`,

                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Okay",
                    style: "destructive",
                    onPress: async () => await markAsFinshed(),
                  },
                ],
                {
                  cancelable: true,
                }
              )
            }
          >
            <DropdownMenu.ItemTitle>Mark as Finished</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon ios={{ name: "checkmark.seal.fill" }} />
          </DropdownMenu.Item>
        ) : null}
        {!isPodcast ? (
          <DropdownMenu.Item key="add_to_playlist" onSelect={addPlaylist}>
            <DropdownMenu.ItemTitle>Add to Playlist</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon ios={{ name: "plus" }} />
          </DropdownMenu.Item>
        ) : null}
        {userProgressPercent > 0 ? (
          <DropdownMenu.Item
            key="discard_progress"
            destructive
            onSelect={() => {
              Alert.alert(
                "Discard Progress",
                `Are you sure you want to reset your progress`,
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Okay",
                    style: "destructive",
                    onPress: async () => await clearProgress(),
                  },
                ],
                {
                  cancelable: true,
                }
              );
            }}
          >
            <DropdownMenu.ItemTitle>Discard Progress</DropdownMenu.ItemTitle>
            <DropdownMenu.ItemIcon ios={{ name: "trash.fill" }} />
          </DropdownMenu.Item>
        ) : null}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default BookMoreMenu;
