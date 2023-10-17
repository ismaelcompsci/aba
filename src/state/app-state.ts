import { atom } from "jotai";

import { User } from "../types/aba";

export const userAtom = atom<User | null>(null);
export const attemptingConnectionAtom = atom(false);
