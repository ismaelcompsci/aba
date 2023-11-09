import { atom, Getter } from "jotai";

import {
  Library,
  LibraryItemExpanded,
  MediaProgress,
  PlaybackSessionExpanded,
  User,
} from "../types/aba";
import { EpubReaderLoading, PlayingState } from "../types/types";

export const userAtom = atom<User | null>(null);
export const attemptingConnectionAtom = atom<boolean>(true);
export const currentLibraryIdAtom = atom<string | null>(null);
export const librariesAtom = atom<Library[]>([]);
export const openModalAtom = atom(false);
export const changingLibraryAtom = atom(false);
export const currentItemAtom = atom<LibraryItemExpanded | null>(null);
export const showPlayerAtom = atom<PlayingState>({ playing: false });
export const playbackSessionAtom = atom<PlaybackSessionExpanded | null>(null);
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

  return libs?.find((lib) => lib.id === libId) || null;
});

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
          get(mediaProgressAtom)
        )
      : update;

  if (user) {
    set(userAtom, { ...user, mediaProgress: nextValue });
  }
});
