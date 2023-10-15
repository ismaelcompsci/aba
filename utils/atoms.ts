import { atom } from "jotai/vanilla";
import { Library, LibraryItem, User } from "../types/adbs";
import { currentLibraryIdAtom } from "./local-atoms";

export const currentItemAtom = atom<LibraryItem | null>(null);

export const currentUserAtom = atom<User | null>(null);

export const librariesAtom = atom<Library[]>([]);

export const currentLibraryAtom = atom<Library | null>((get) => {
  const libId = get(currentLibraryIdAtom);
  const libs = get(librariesAtom);
  return libs.find((lib) => lib.id === libId) || null;
});

export const serversModalVisibleAtom = atom(false);

export const bookTocAtom = atom(null);
