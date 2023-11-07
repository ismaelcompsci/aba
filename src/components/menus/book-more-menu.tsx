import { useState } from "react";
import { Alert } from "react-native";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import axios from "axios";
import { useAtom, useAtomValue } from "jotai";
import { Button } from "tamagui";
import * as DropdownMenu from "zeego/dropdown-menu";

import { userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { MediaProgress, User } from "../../types/aba";
import { cleanString } from "../../utils/utils";

function BookMoreMenu({
  userMediaProgress,
  title,
  itemId,
}: {
  userMediaProgress: MediaProgress | undefined;
  title: string | null;
  itemId: string;
}) {
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const [user, setUser] = useAtom(userAtom);

  const [loading, setLoading] = useState(false);

  const markAsFinshed = async () => {
    try {
      setLoading(true);
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
        const updatedUser = await getUpdatedUser();
        if (updatedUser) setUser(updatedUser);
      }
    } catch (error) {
      console.log("[APPDIALOG] mark as finshed error", error);
    } finally {
      setLoading(false);
    }
  };

  const clearProgress = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${serverConfig.serverAddress}/api/me/progress/${userMediaProgress?.id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      if (response.data) {
        const updatedUser = await getUpdatedUser();
        if (updatedUser) setUser(updatedUser);
      }
    } catch (error) {
      console.log("[APPDIALOG] clear progress error", error);
    } finally {
      setLoading(false);
    }
  };

  const getUpdatedUser = async () => {
    try {
      const response = await axios.get(`${serverConfig.serverAddress}/api/me`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      return response.data as User;
    } catch (error) {
      console.log("[APPDIALOG] getUpdatedUser error", error);
      return;
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button>
          <MoreHorizontal />
        </Button>
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
                `Are you sure you want to discard progress`,
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
