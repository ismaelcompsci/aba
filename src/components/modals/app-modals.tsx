import {
  bookmarksModalAtom,
  createPlaylistModalAtom,
  showPlayerAtom,
} from "../../state/app-state";
import { LazyModalRenderer } from "../../utils/lazy-modal-render";
import AudioPlayerContainer from "../audio-player/audio-player";

import AddPlaylistsModal, {
  AddPlaylistsModalAtom,
} from "./add-playlists-modal";
import { BookmarksModal } from "./bookmarks-modal";
import ChaptersModal, { chaptersModalAtom } from "./chapter-modal";
import { CreatePlaylistModal } from "./create-playlist-modal";

export const AppModals = () => {
  return (
    <>
      <LazyModalRenderer atom={showPlayerAtom}>
        <AudioPlayerContainer />
      </LazyModalRenderer>

      <LazyModalRenderer atom={AddPlaylistsModalAtom}>
        <AddPlaylistsModal />
      </LazyModalRenderer>

      <LazyModalRenderer atom={chaptersModalAtom}>
        <ChaptersModal />
      </LazyModalRenderer>

      <LazyModalRenderer atom={bookmarksModalAtom}>
        <BookmarksModal />
      </LazyModalRenderer>

      <LazyModalRenderer atom={createPlaylistModalAtom}>
        <CreatePlaylistModal />
      </LazyModalRenderer>
    </>
  );
};
