import { atom, Getter } from "jotai";
import { selectAtom } from "jotai/utils";

import { TocItem } from "../components/epub-reader/rn-epub-reader";
import {
  Library,
  LibraryItemExpanded,
  MediaProgress,
  PlaybackSessionExpanded,
  User,
} from "../types/aba";
import {
  BaseModalAtom,
  BookmarksModalAtom,
  CreatePlaylistModalAtom,
  EpubReaderLoading,
  PlayingState,
} from "../types/types";

import { currentServerConfigAtom } from "./local-state";

export const userAtom = atom<User | null>(null);
export const attemptingConnectionAtom = atom<boolean>(true);
export const currentLibraryIdAtom = atom<string | null>(null);
export const librariesAtom = atom<Library[]>([]);
export const openModalAtom = atom(false);
export const changingLibraryAtom = atom(false);
export const currentItemAtom = atom<LibraryItemExpanded | null>(null);
export const playbackSessionAtom = atom<PlaybackSessionExpanded | null>(null);
export const showPlayerAtom = atom<PlayingState>({
  open: false,
  playing: false,
});
export const createPlaylistModalAtom = atom<CreatePlaylistModalAtom>({
  open: false,
});
export const bookmarksModalAtom = atom<BookmarksModalAtom>({
  open: false,
});

/* epub reader atoms */
export const epubReaderOverviewModalAtom = atom(false);
export const epubReaderTocAtom = atom<TocItem[] | null>(null);
export const epubReaderLoadingAtom = atom<EpubReaderLoading>({
  loading: false,
  part: "",
  percent: undefined,
});

/**
 * Derived Atoms
 */

export const currentLibraryAtom = atom<Library | null>((get) => {
  const libId = get(currentLibraryIdAtom);
  const libs = get(librariesAtom);
  if (!libs) return null;

  return libs?.find((lib) => lib.id === libId) ?? null;
});

export const isCoverSquareAspectRatioAtom = selectAtom(
  currentLibraryAtom,
  (library) => library?.settings.coverAspectRatio === 1
);

export const userTokenAtom = selectAtom(userAtom, (user) => user?.token);
export const serverAddressAtom = selectAtom(
  currentServerConfigAtom,
  (server) => server.serverAddress
);

export const mediaProgressAtom = atom((get: Getter) => {
  const user = get(userAtom);
  const userMediaProgress = user?.mediaProgress;

  return userMediaProgress;
});

export const setMediaProgressAtom = atom(null, (get, set, update) => {
  const user = get(userAtom);

  const nextValue =
    typeof update === "function"
      ? (update as (prev: MediaProgress[]) => MediaProgress[])(
          get(mediaProgressAtom) || []
        )
      : (update as MediaProgress[]);

  if (user) {
    set(userAtom, { ...user, mediaProgress: nextValue });
  }
});

export const currentLibraryMediaTypeAtom = atom(
  (get) => get(currentLibraryAtom)?.mediaType
);

export const isAdminOrUpAtom = atom((get) => {
  const user = get(userAtom);
  return user && (user.type === "admin" || user?.type === "root");
});

export const bookmarksAtom = atom((get) => get(userAtom)?.bookmarks ?? []);

export const currentPlayingLibraryIdAtom = atom(
  (get) => get(playbackSessionAtom)?.libraryItemId
);
