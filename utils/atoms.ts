import { atom } from "jotai/vanilla";
import { LibraryItem } from "../types/server";

export const showReaderAtom = atom(false);

export const currentItemAtom = atom<LibraryItem | null>(null);
