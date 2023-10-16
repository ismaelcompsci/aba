import { atom } from "jotai";

import { User } from "../types/aba";

import { DefaultSettings } from "./default-state";

export const appThemeAtom = atom(DefaultSettings.theme);

export const userAtom = atom<User | null>(null);
export const attemptingConnectionAtom = atom(false);
