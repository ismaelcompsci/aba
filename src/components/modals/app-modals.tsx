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
import ChaptersModal from "./chapter-modal";
import { CreatePlaylistModal } from "./create-playlist-modal";
import { PlaylistModal, playlistModalAtom } from "./playlist-modal";
import {
  PodcastEpisodeSearchModal,
  podcastEpisodeSearchModalAtom,
} from "./podcast-episode-search-modal";

export const AppModals = () => {
  return (
    <>
      <LazyModalRenderer atom={showPlayerAtom}>
        <AudioPlayerContainer />
      </LazyModalRenderer>

      <LazyModalRenderer atom={AddPlaylistsModalAtom}>
        <AddPlaylistsModal />
      </LazyModalRenderer>

      {/* <LazyModalRenderer atom={chaptersModalAtom} > */}
      <ChaptersModal />
      {/* </LazyModalRenderer> */}

      <LazyModalRenderer atom={bookmarksModalAtom}>
        <BookmarksModal />
      </LazyModalRenderer>

      <LazyModalRenderer atom={createPlaylistModalAtom}>
        <CreatePlaylistModal />
      </LazyModalRenderer>

      <LazyModalRenderer atom={podcastEpisodeSearchModalAtom}>
        <PodcastEpisodeSearchModal />
      </LazyModalRenderer>

      <LazyModalRenderer atom={playlistModalAtom}>
        <PlaylistModal />
      </LazyModalRenderer>
    </>
  );
};
