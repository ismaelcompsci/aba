import { LazyModalRenderer } from "../../utils/lazy-modal-render";

import AddPlaylistsModal, {
  AddPlaylistsModalAtom,
} from "./add-playlists-modal";
import { CreatePlaylistModal } from "./create-playlist-modal";

export const AppModals = () => {
  return (
    <>
      <LazyModalRenderer atom={AddPlaylistsModalAtom}>
        <AddPlaylistsModal />
      </LazyModalRenderer>

      <CreatePlaylistModal />
    </>
  );
};
