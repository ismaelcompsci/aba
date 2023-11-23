import { Alert } from "react-native";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import axios from "axios";
import * as Burnt from "burnt";
import { useAtomValue } from "jotai";
import * as DropdownMenu from "zeego/dropdown-menu";

import { useNewUser } from "../../hooks/use-new-user";
import { mediaProgressAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { cleanString } from "../../utils/utils";
import { TouchableArea } from "../touchable/touchable-area";

function BookMoreMenu({
  title,
  itemId,
}: {
  title: string | null;
  itemId: string;
}) {
  const mediaProgress = useAtomValue(mediaProgressAtom);
  const userMediaProgress = mediaProgress?.find(
    (prog) => prog.libraryItemId === itemId
  );
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const { user, refreshUser } = useNewUser(true);

  const markAsFinshed = async () => {
    try {
      const markAsFinshed = true;
      const data = {
        isFinished: markAsFinshed,
      };
      const response = await axios.patch(
        `${serverConfig.serverAddress}/api/me/progress/${itemId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.data) {
        await refreshUser();
      }
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
      const response = await axios.delete(
        `${serverConfig.serverAddress}/api/me/progress/${userMediaProgress?.id}`,
        {
          headers: {
            Authorization: `Bearer ${serverConfig?.token}`,
          },
        }
      );

      if (response.data) {
        await refreshUser();
      }
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

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <TouchableArea hapticFeedback onPress={() => {}} px="$2">
          <MoreHorizontal />
        </TouchableArea>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Book Actions</DropdownMenu.Label>
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
        {userMediaProgress ? (
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
