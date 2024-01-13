import React, {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { Dimensions } from "react-native";
import type WebView from "react-native-webview";

import { themes } from "../components/themes";

import type { Annotation, ePubCfi, MenuActions, Theme } from "./types";

type ActionMap<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
        payload: M[Key];
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

enum Types {
  CHANGE_THEME = "CHANGE_THEME",
  SET_KEY = "SET_KEY",
  SET_META = "SET_META",
  SET_PROGRESS = "SET_PROGRESS",
  SET_LOCATIONS = "SET_LOCATIONS",
  SET_IS_LOADING = "SET_IS_LOADING",
  SET_IS_RENDERING = "SET_IS_RENDERING",
  SET_IS_PDF = "SET_IS_PDF",
  SET_COVER = "SET_COVER",
}

type BookPayload = {
  [Types.CHANGE_THEME]: Theme;
  [Types.SET_KEY]: string;
  [Types.SET_LOCATIONS]: ePubCfi[];
  [Types.SET_IS_LOADING]: boolean;
  [Types.SET_IS_RENDERING]: boolean;
  [Types.SET_IS_PDF]: boolean;
  [Types.SET_COVER]: string;
};

type BookActions = ActionMap<BookPayload>[keyof ActionMap<BookPayload>];

type InitialState = {
  theme: Theme;
  key: string;
  isLoading: boolean;
  isRendering: boolean;
  isPdf: boolean;
  cover: string;
};

const w = Dimensions.get("window").width;

export const defaultTheme: Theme = {
  lineHeight: 1.5,
  justify: true,
  hyphenate: true,
  gap: 0.06,
  maxInlineSize: w,
  maxBlockSize: 1440,
  maxColumnCount: 1,
  scrolled: false,
  fontSize: 100,
  theme: "dark",
};

const initialState: InitialState = {
  theme: defaultTheme,
  key: "",
  isLoading: true,
  isRendering: true,
  isPdf: false,
  cover: "",
};

function bookReducer(state: InitialState, action: BookActions): InitialState {
  switch (action.type) {
    case Types.SET_KEY:
      return {
        ...state,
        key: action.payload,
      };
    case Types.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case Types.SET_IS_RENDERING:
      return {
        ...state,
        isRendering: action.payload,
      };
    case Types.SET_IS_PDF:
      return {
        ...state,
        isPdf: action.payload,
      };
    case Types.SET_COVER:
      return {
        ...state,
        cover: action.payload,
      };
    default:
      return state;
  }
}

export interface ReaderContextProps {
  openMenu: ({ x, y }: { x: number; y: number }) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  useMenuAction: (action: MenuActions) => void;
  registerBook: (bookRef: WebView) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRendering: (isRendering: boolean) => void;
  setIsPdf: (isPdf: boolean) => void;
  setCover: (cover: string) => void;
  goToLocation: (cfi: string | number) => void;

  // /**
  //  * Go to previous page in the book
  //  */
  goPrevious: () => void;

  // /**
  //  * Go to next page in the book
  //  */
  goNext: () => void;

  // /**
  //  * @param theme {@link Theme}
  //  * @description Theme object.
  //  * @example
  //  * ```
  //  * selectTheme({ body: { background: '#fff' } });
  //  * ```
  //  */
  changeTheme: (theme: Theme) => void;

  // /**
  //  * A theme object.
  //  */
  theme: Theme;

  /**
   * Indicates if the book is loading
   * @returns {boolean} {@link boolean}
   */
  isLoading: boolean;

  // /**
  //  * Indicates if the book is rendering
  //  * @returns {boolean} {@link boolean}
  //  */
  isRendering: boolean;

  isPdf: boolean;
  /**
   * book cover in base64
   */
  cover: string;
}

const ReaderContext = createContext<ReaderContextProps>({
  setAnnotations: () => {},
  openMenu: () => {},
  useMenuAction: () => {},
  registerBook: () => {},
  setIsLoading: () => {},
  setIsRendering: () => {},
  setIsPdf: () => {},
  goToLocation: () => {},
  goPrevious: () => {},
  goNext: () => {},
  setCover: () => {},
  changeTheme: () => {},
  theme: defaultTheme,
  isLoading: true,
  isRendering: true,
  isPdf: false,
  cover: "",
});

function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookReducer, initialState);
  const book = useRef<WebView | null>(null);

  const registerBook = useCallback((bookRef: WebView) => {
    book.current = bookRef;
  }, []);

  const openMenu = useCallback(({ x, y }: { x: number; y: number }) => {
    book.current?.openMenu({ x, y });
  }, []);

  const changeTheme = useCallback((newTheme: Theme) => {
    const t = themes.find((theme) => theme.name === newTheme.theme);
    const _newTheme = {
      style: {
        lineHeight: newTheme.lineHeight,
        justify: newTheme.justify,
        hyphenate: newTheme.hyphenate,
        theme: t,
        fontSize: newTheme.fontSize,
      },
      layout: {
        gap: newTheme.gap,
        maxInlineSize: newTheme.maxInlineSize,
        maxBlockSize: newTheme.maxBlockSize,
        maxColumnCount: newTheme.maxColumnCount,
        flow: newTheme.scrolled,
      },
    };
    book.current?.injectJavaScript(`
        reader.setTheme(${JSON.stringify(_newTheme)});
        true
    `);
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: Types.SET_IS_LOADING, payload: isLoading });
  }, []);

  const setIsRendering = useCallback((isRendering: boolean) => {
    dispatch({ type: Types.SET_IS_RENDERING, payload: isRendering });
  }, []);

  const goToLocation = useCallback((target: string | number) => {
    if (state.isPdf) {
      return;
      // const newLocation = JSON.parse(target);
      // book.current?.injectJavaScript(
      //   `reader.view.goTo(Number(${Math.max(0, newLocation[0].num)})); true`
      // );
    }
    if (typeof target === "number") {
      book.current?.injectJavaScript(
        `reader.view.goToFraction(${target}); true`
      );
    } else
      book.current?.injectJavaScript(`reader.view.goTo("${target}"); true`);
  }, []);

  const goPrevious = useCallback(() => {
    book.current?.injectJavaScript(`reader.view.prev(); true;`);
  }, []);

  const goNext = useCallback(() => {
    book.current?.injectJavaScript(`reader.view.next(); true`);
    return true;
  }, []);

  const setCover = useCallback((cover: string) => {
    dispatch({ type: Types.SET_COVER, payload: cover });
  }, []);

  // @ts-ignore
  const useMenuAction = useCallback(({ action, value }: MenuActions) => {
    if (value) {
      book.current?.injectJavaScript(`
      reader.onSelectedResponse({ action: '${action}', value: '${value}' });
      `);
    } else {
      book.current?.injectJavaScript(`
      reader.onSelectedResponse({ action: '${action}' });
      `);
    }
  }, []);

  const setAnnotations = useCallback((annotations: Annotation[]) => {
    book.current?.injectJavaScript(`
         reader.setAnnotations(${JSON.stringify(annotations)}); true
    `);
  }, []);

  const setIsPdf = useCallback((isPdf: boolean) => {
    dispatch({ type: Types.SET_IS_PDF, payload: isPdf });
  }, []);

  const setKey = useCallback((key: string) => {
    dispatch({ type: Types.SET_KEY, payload: key });
  }, []);

  const contextValue = useMemo(
    () => ({
      openMenu,
      setAnnotations,
      useMenuAction,
      registerBook,
      setIsLoading,
      setIsRendering,
      setIsPdf,
      setCover,

      goToLocation,
      goPrevious,
      goNext,
      setKey,
      changeTheme,
      key: state.key,
      theme: state.theme,
      isLoading: state.isLoading,
      isRendering: state.isRendering,
      isPdf: state.isPdf,
      cover: state.cover,
    }),
    [
      openMenu,
      useMenuAction,
      setAnnotations,
      changeTheme,
      goNext,
      goPrevious,
      goToLocation,
      registerBook,
      setIsLoading,
      setIsRendering,
      setIsPdf,
      setKey,
      setCover,
      state.isLoading,
      state.isRendering,
      state.key,
      state.theme,
      state.isPdf,
      state.cover,
    ]
  );
  return (
    <ReaderContext.Provider value={contextValue}>
      {children}
    </ReaderContext.Provider>
  );
}

export { ReaderContext, ReaderProvider };
