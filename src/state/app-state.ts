import { atom } from "jotai";

import { Library, User } from "../types/aba";

export const userAtom = atom<User | null>(null);
export const attemptingConnectionAtom = atom<boolean>(false);
export const currentLibraryIdAtom = atom<string | null>(null);
export const librariesAtom = atom<Library[]>([]);

/**
 * Derived Atoms
 */
export const currentLibraryAtom = atom<Library | null>((get) => {
  const libId = get(currentLibraryIdAtom);
  const libs = get(librariesAtom);
  if (!libs) return null;

  return libs?.find((lib) => lib.id === libId) || null;
});
