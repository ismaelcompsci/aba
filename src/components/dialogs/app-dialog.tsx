import { useState } from "react";
import { useWindowDimensions } from "react-native";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";
import { Button, Dialog, Spinner, XStack } from "tamagui";

import { userAtom } from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { User } from "../../types/aba";

type AppDialog = {
  open: boolean;
  title?: string;
  description?: string;
  action: string;
  progressId?: string;
  itemId?: string;
};

export const appDialogAtom = atom<AppDialog>({
  open: false,
  action: "close",
});

const AppDialog = () => {
  const [appDialog, setAppDialog] = useAtom(appDialogAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const [user, setUser] = useAtom(userAtom);

  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();

  const handleActionPress = async () => {
    const action = appDialog.action;
    switch (action) {
      case "progress":
        await clearProgress();
        setAppDialog({ open: false, action: "close" });
        break;
      case "mark_as_finshed":
        await markAsFinshed();
        setAppDialog({ open: false, action: "close" });
        break;
      default:
        setAppDialog({ open: false, action: "close" });
        break;
    }
  };
  const markAsFinshed = async () => {
    try {
      setLoading(true);
      const markAsFinshed = true;
      const data = {
        isFinished: markAsFinshed,
      };
      const response = await axios.patch(
        `${serverConfig.serverAddress}/api/me/progress/${appDialog.itemId}`,
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
        `${serverConfig.serverAddress}/api/me/progress/${appDialog.progressId}`,
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
    <Dialog modal open={appDialog.open} key="app-modal">
      <Dialog.Portal>
        <Dialog.Overlay key="app-modal-overlay" />
        <Dialog.Content width={width * 0.8}>
          <Dialog.Title>
            {appDialog.title ? appDialog.title : "Discard Progress"}
          </Dialog.Title>
          <Dialog.Description>
            {appDialog.description
              ? appDialog.description
              : "Are you sure you want to discard progress"}
          </Dialog.Description>
          <XStack jc="space-between" pt="$4" gap={"$8"}>
            <Button
              flex={1}
              onPress={() => setAppDialog({ open: false, action: "close" })}
              disabled={loading}
              opacity={loading ? 0.5 : 1}
            >
              Cancel
            </Button>
            <Button
              flex={1}
              theme={"red_active"}
              onPress={handleActionPress}
              disabled={loading}
              opacity={loading ? 0.5 : 1}
              jc="center"
              ai="center"
              gap="$2"
            >
              Okay
              {loading ? <Spinner size="small" /> : null}
            </Button>
          </XStack>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default AppDialog;
