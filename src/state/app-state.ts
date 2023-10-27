import { atom } from "jotai";

import { Library, LibraryItemExpanded, User } from "../types/aba";

export const userAtom = atom<User | null>(null);
export const attemptingConnectionAtom = atom<boolean>(true);
export const currentLibraryIdAtom = atom<string | null>(null);
export const librariesAtom = atom<Library[]>([]);
export const openModalAtom = atom(false);
export const changingLibraryAtom = atom(false);
export const currentItemAtom = atom<LibraryItemExpanded | null>(null);

/**
 * Derived Atoms
 */
export const currentLibraryAtom = atom<Library | null>((get) => {
  const libId = get(currentLibraryIdAtom);
  const libs = get(librariesAtom);
  if (!libs) return null;

  return libs?.find((lib) => lib.id === libId) || null;
});
