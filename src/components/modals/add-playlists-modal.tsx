import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { atom, useAtom, useAtomValue } from "jotai";

import { LIBRARY_INFINITE_LIMIT } from "../../constants/consts";
import {
  currentLibraryIdAtom,
  serverAddressAtom,
  userTokenAtom,
} from "../../state/app-state";
import { PlaylistExpanded } from "../../types/aba";
import {
  AppBottomSheetModal,
  HandleBar,
} from "../custom-components/bottom-sheet-modal";
import { Flex } from "../layout/flex";
import { Screen } from "../layout/screen";

type AddPlaylistsModalControllerType = {
  open: boolean;
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

  const { data, isLoading } = useQuery({
    queryKey: ["playlists", currentLibraryId],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const response: { data: { results: PlaylistExpanded[] } } =
          await axios.get(
            `${serverAddress}/api/libraries/${currentLibraryId}/playlists`,
            {
              params: {
                limit: LIBRARY_INFINITE_LIMIT,
                page: pageParam,
              },
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

        return { data: response.data, nextPage: pageParam + 1 };
      } catch (error) {
        console.log("[PLAYLISTS_PAGE] error ", error);
      }
    },
  });

  const onClose = () => {
    setAddPlaylistModalController({ open: false });
  };

  if (!addPlaylistsModalController.open) {
    return null;
  }

  return (
    <AppBottomSheetModal
      fullScreen
      hideHandlebar
      renderBehindTopInset
      onClose={onClose}
    >
      <Screen edges={["top"]}>
        <HandleBar />
        <Flex fill></Flex>
      </Screen>
    </AppBottomSheetModal>
  );
};

export default AddPlaylistsModal;
