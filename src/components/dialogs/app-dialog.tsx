import { useWindowDimensions } from "react-native";
import axios from "axios";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Button, Dialog, XStack } from "tamagui";

import {
  mediaProgressAtom,
  setMediaProgressAtom,
  userAtom,
} from "../../state/app-state";
import { currentServerConfigAtom } from "../../state/local-state";
import { useQueryClient } from "@tanstack/react-query";

type AppDialog = {
  open: boolean;
  title?: string;
  description?: string;
  action: string;
  progressId?: string;
};

export const appDialogAtom = atom<AppDialog>({
  open: false,
  action: "close",
});

const AppDialog = () => {
  const [appDialog, setAppDialog] = useAtom(appDialogAtom);
  const serverConfig = useAtomValue(currentServerConfigAtom);
  const user = useAtomValue(userAtom);
  const [mediaProgress] = useAtom(mediaProgressAtom);
  const setMediaProgress = useSetAtom(setMediaProgressAtom);
  const queryClient = useQueryClient();

  const { width } = useWindowDimensions();

  const handleActionPress = async () => {
    const action = appDialog.action;
    switch (action) {
      case "progress":
        await clearProgress();
        setAppDialog({ open: false, action: "close" });
        break;
      default:
        setAppDialog({ open: false, action: "close" });
        break;
    }
  };

  const clearProgress = async () => {
    try {
      await axios.delete(
        `${serverConfig.serverAddress}/api/me/progress/${appDialog.progressId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const newMedia = mediaProgress?.filter(
        (value) => value.id !== appDialog.progressId
      );
      if (newMedia) {
        setMediaProgress(newMedia);
        queryClient.resetQueries([
          "personalized-library-view",
          "library-items",
        ]);
      }
    } catch (error) {
      console.log("[APPDIALOG] clear progress error", error);
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
            >
              Cancel
            </Button>
            <Button flex={1} theme={"red_active"} onPress={handleActionPress}>
              Okay
            </Button>
          </XStack>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default AppDialog;
