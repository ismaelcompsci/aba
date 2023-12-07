import { LazyModalRenderer } from "../../utils/lazy-modal-render";

import AddPlaylistsModal, {
  AddPlaylistsModalAtom,
} from "./add-playlists-modal";

export const AppModals = () => {
  return (
    <>
      <LazyModalRenderer atom={AddPlaylistsModalAtom}>
        <AddPlaylistsModal />
      </LazyModalRenderer>
    </>
  );
};
