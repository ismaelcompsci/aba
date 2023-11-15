import type { Theme } from "./types";

export type InitialStateType = {
  themes: any;
  activeTheme: string;
};

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export enum Types {
  REGISTER_THEME = "REGISTER_THEME",
  REGISTER_THEMES = "REGISTER_THEMES",
  SELECT_THEME = "SELECT_THEME",
}

type BookPayload = {
  [Types.REGISTER_THEME]: Theme;
  [Types.REGISTER_THEMES]: any;
  [Types.SELECT_THEME]: string;
};

export type BookActions = ActionMap<BookPayload>[keyof ActionMap<BookPayload>];

export const bookReducer = (state: InitialStateType, action: BookActions) => {
  switch (action.type) {
    case Types.REGISTER_THEME:
      return {
        ...state.themes,
        ...action.payload,
      };
    default:
      return state;
  }
};
