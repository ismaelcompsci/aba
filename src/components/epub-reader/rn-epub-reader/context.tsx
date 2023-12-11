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

import type {
  Annotation,
  ePubCfi,
  LocationChange,
  MenuActions,
  ReaderBookMetadata,
  SearchResult,
  Theme,
} from "./types";

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
  CHANGE_FONT_SIZE = "CHANGE_FONT_SIZE",
  CHANGE_FONT_FAMILY = "CHANGE_FONT_FAMILY",
  SET_AT_START = "SET_AT_START",
  SET_AT_END = "SET_AT_END",
  SET_KEY = "SET_KEY",
  SET_TOTAL_LOCATIONS = "SET_TOTAL_LOCATIONS",
  SET_CURRENT_LOCATION = "SET_CURRENT_LOCATION",
  SET_META = "SET_META",
  SET_PROGRESS = "SET_PROGRESS",
  SET_LOCATIONS = "SET_LOCATIONS",
  SET_IS_LOADING = "SET_IS_LOADING",
  SET_IS_RENDERING = "SET_IS_RENDERING",
  SET_SEARCH_RESULTS = "SET_SEARCH_RESULTS",
  SET_IS_PDF = "SET_IS_PDF",
  SET_COVER = "SET_COVER",
}

type BookPayload = {
  [Types.CHANGE_THEME]: Theme;
  [Types.CHANGE_FONT_SIZE]: number;
  [Types.CHANGE_FONT_FAMILY]: string;
  [Types.SET_AT_START]: boolean;
  [Types.SET_AT_END]: boolean;
  [Types.SET_KEY]: string;
  [Types.SET_TOTAL_LOCATIONS]: number;
  [Types.SET_CURRENT_LOCATION]: LocationChange;
  [Types.SET_META]: ReaderBookMetadata;
  [Types.SET_PROGRESS]: number;
  [Types.SET_LOCATIONS]: ePubCfi[];
  [Types.SET_IS_LOADING]: boolean;
  [Types.SET_IS_RENDERING]: boolean;
  [Types.SET_SEARCH_RESULTS]: SearchResult[];
  [Types.SET_IS_PDF]: boolean;
  [Types.SET_COVER]: string;
};

type BookActions = ActionMap<BookPayload>[keyof ActionMap<BookPayload>];

type InitialState = {
  theme: Theme;
  fontFamily: string;
  fontSize: number;
  atStart: boolean;
  atEnd: boolean;
  key: string;
  currentLocation: LocationChange | null;
  meta: ReaderBookMetadata;
  progress: number;
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
  fontFamily: "Helvetica",
  fontSize: 16,
  atStart: false,
  atEnd: false,
  key: "",
  currentLocation: null,
  meta: {
    author: "",
    title: "",
    description: "",
    language: "",
    publisher: "",
  },
  progress: 0,
  isLoading: true,
  isRendering: true,
  isPdf: false,
  cover: "",
};

function bookReducer(state: InitialState, action: BookActions): InitialState {
  switch (action.type) {
    case Types.CHANGE_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case Types.CHANGE_FONT_SIZE:
      return {
        ...state,
        fontSize: action.payload,
      };
    case Types.CHANGE_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.payload,
      };
    case Types.SET_AT_START:
      return {
        ...state,
        atStart: action.payload,
      };
    case Types.SET_AT_END:
      return {
        ...state,
        atEnd: action.payload,
      };
    case Types.SET_KEY:
      return {
        ...state,
        key: action.payload,
      };
    case Types.SET_CURRENT_LOCATION:
      return {
        ...state,
        currentLocation: action.payload,
      };
    case Types.SET_META:
      return {
        ...state,
        meta: action.payload,
      };
    case Types.SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
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
  initTTS: () => void;
  startTTS: () => void;
  resumeTTS: () => void;
  nextTTS: (paused: boolean) => void;
  prevTTS: (paused: boolean) => void;
  setMarkTTS: (mark: string) => void;
  pauseTTSMark: (stopping?: boolean) => void;
  openMenu: ({ x, y }: { x: number; y: number }) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  useMenuAction: (action: MenuActions) => void;
  registerBook: (bookRef: WebView) => void;
  // setAtStart: (atStart: boolean) => void;
  // setAtEnd: (atEnd: boolean) => void;
  // setTotalLocations: (totalLocations: number) => void;
  setCurrentLocation: (location: LocationChange) => void;
  setMeta: (meta: ReaderBookMetadata) => void;
  // setProgress: (progress: number) => void;
  // setLocations: (locations: ePubCfi[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsRendering: (isRendering: boolean) => void;
  setIsPdf: (isPdf: boolean) => void;
  setCover: (cover: string) => void;

  /**
   * Go to specific location in the book
   * @param {ePubCfi} target {@link ePubCfi}
   */
  goToLocation: (cfi: ePubCfi) => void;

  // /**
  //  * Go to previous page in the book
  //  */
  goPrevious: () => void;

  // /**
  //  * Go to next page in the book
  //  */
  goNext: () => void;

  // /**
  //  * Get the total locations of the book
  //  */
  // getLocations: () => ePubCfi[];

  // /**
  //  * Returns the current location of the book
  //  * @returns {LocationChange} {@link LocationChange}
  //  */
  // getCurrentLocation: () => LocationChange | null;

  /**
   * Returns an object containing the book's metadata
   * @returns {ReaderBookMetadata}
   */
  getMeta: () => ReaderBookMetadata;

  // /**
  //  * Search for a specific text in the book
  //  * @param {string} query {@link string} text to search
  //  */
  // search: (query: string) => void;

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
  //  * Change font size of all elements in the book
  //  * @param font
  //  * @see https://www.w3schools.com/cssref/css_websafe_fonts.asp
  //  */
  // changeFontFamily: (fontFamily: string) => void;

  // /**
  //  * Change font size of all elements in the book
  //  * @param {FontSize} size {@link FontSize}
  //  */
  // changeFontSize: (size: number) => void;

  // /**
  //  * Add Mark a specific cfi in the book
  //  */
  // addMark: (
  //   type: Mark,
  //   cfiRange: ePubCfi,
  //   data?: any,
  //   callback?: () => void,
  //   className?: string,
  //   styles?: any
  // ) => void;

  // /**
  //  * Remove Mark a specific cfi in the book
  //  */
  // removeMark: (cfiRange: ePubCfi, type: Mark) => void;

  // setKey: (key: string) => void;

  // /**
  //  * Works like a unique id for book
  //  */
  // key: string;

  // /**
  //  * A theme object.
  //  */
  theme: Theme;

  // /**
  //  * Indicates if you are at the beginning of the book
  //  * @returns {boolean} {@link boolean}
  //  */
  // atStart: boolean;

  // /**
  //  * Indicates if you are at the end of the book
  //  * @returns {boolean} {@link boolean}
  //  */
  // atEnd: boolean;

  // /**
  //  * The total number of locations
  //  */
  // totalLocations: number;

  /**
   * The current location of the book
   */
  currentLocation: LocationChange | null;

  /**
   * An object containing the book's metadata
   */
  meta: ReaderBookMetadata;

  // /**
  //  * The progress of the book
  //  * @returns {number} {@link number}
  //  */
  // progress: number;

  // locations: ePubCfi[];

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
  // /**
  //  * Search results
  //  * @returns {SearchResult[]} {@link SearchResult[]}
  //  */
  // searchResults: SearchResult[];

  // setSearchResults: (results: SearchResult[]) => void;
  // changePageFlow: (pageFlow: "paginated" | "scrolled") => void;
  /**
   * book cover in base64
   */
  cover: string;
}

const ReaderContext = createContext<ReaderContextProps>({
  initTTS: () => {},
  startTTS: () => {},
  resumeTTS: () => {},
  nextTTS: () => {},
  prevTTS: () => {},
  setMarkTTS: () => {},
  pauseTTSMark: () => {},
  setAnnotations: () => {},
  openMenu: () => {},
  useMenuAction: () => {},
  registerBook: () => {},
  // setAtStart: () => {},
  // setAtEnd: () => {},
  // setTotalLocations: () => {},
  setCurrentLocation: () => {},
  setMeta: () => {},
  // setProgress: () => {},
  // setLocations: () => {},
  setIsLoading: () => {},
  setIsRendering: () => {},
  setIsPdf: () => {},
  goToLocation: () => {},
  goPrevious: () => {},
  goNext: () => {},
  // getLocations: () => [],
  // getCurrentLocation: () => null,
  getMeta: () => ({
    author: "",
    title: "",
    description: "",
    language: "",
    publisher: "",
  }),
  // search: () => {},
  setCover: () => {},

  changeTheme: () => {},
  // changeFontFamily: () => {},
  // changeFontSize: () => {},

  // addMark: () => {},
  // removeMark: () => {},

  // setKey: () => {},
  // key: "",

  theme: defaultTheme,
  // atStart: false,
  // atEnd: false,
  // totalLocations: 0,
  currentLocation: null,
  meta: {
    author: "",
    title: "",
    description: "",
    language: "",
    publisher: "",
  },
  // progress: 0,
  // locations: [],
  isLoading: true,
  isRendering: true,
  isPdf: false,
  cover: "",

  // searchResults: [],
  // setSearchResults: () => {},
  // changePageFlow: () => {},
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
    // dispatch({ type: Types.CHANGE_THEME, payload: newTheme });
  }, []);

  // const changeFontFamily = useCallback((fontFamily: string) => {
  //   book.current?.injectJavaScript(`
  //     rendition.themes.font('${fontFamily}');
  //   `);
  //   dispatch({ type: Types.CHANGE_FONT_FAMILY, payload: fontFamily });
  // }, []);

  // const setAtStart = useCallback((atStart: boolean) => {
  //   dispatch({ type: Types.SET_AT_START, payload: atStart });
  // }, []);

  // const setAtEnd = useCallback((atEnd: boolean) => {
  //   dispatch({ type: Types.SET_AT_END, payload: atEnd });
  // }, []);

  const setCurrentLocation = useCallback((location: LocationChange) => {
    dispatch({ type: Types.SET_CURRENT_LOCATION, payload: location });
  }, []);

  const setMeta = useCallback((meta: ReaderBookMetadata) => {
    dispatch({ type: Types.SET_META, payload: meta });
  }, []);

  // const setProgress = useCallback((progress: number) => {
  //   dispatch({ type: Types.SET_PROGRESS, payload: progress });
  // }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: Types.SET_IS_LOADING, payload: isLoading });
  }, []);

  const setIsRendering = useCallback((isRendering: boolean) => {
    dispatch({ type: Types.SET_IS_RENDERING, payload: isRendering });
  }, []);

  const goToLocation = useCallback((target: string) => {
    if (state.isPdf) {
      return;
      const newLocation = JSON.parse(target);
      book.current?.injectJavaScript(
        `reader.view.goTo(Number(${Math.max(0, newLocation[0].num)})); true`
      );
    } else {
      book.current?.injectJavaScript(`reader.view.goTo("${target}"); true`);
    }
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

  const getMeta = useCallback(() => state.meta, [state.meta]);

  const useMenuAction = useCallback(({ action }: MenuActions) => {
    book.current?.injectJavaScript(`
    reader.onSelectedResponse({ action: '${action}' });
    `);
  }, []);

  const setAnnotations = useCallback((annotations: Annotation[]) => {
    book.current?.injectJavaScript(`
         reader.setAnnotations(${JSON.stringify(annotations)}); true
    `);
  }, []);

  // TODO
  const deleteAnnotation = useCallback(() => {}, []);

  // const search = useCallback((query: string) => {
  //   book.current?.injectJavaScript(`
  //     Promise.all(
  //       book.spine.spineItems.map((item) => {
  //         return item.load(book.load.bind(book)).then(() => {
  //           let results = item.find('${query}'.trim());
  //           item.unload();
  //           return Promise.resolve(results);
  //         });
  //       })
  //     ).then((results) =>
  //       window.ReactNativeWebView.postMessage(
  //         JSON.stringify({ type: 'onSearch', results: [].concat.apply([], results) })
  //       )
  //     ); true
  //   `);
  // }, []);

  // const setSearchResults = useCallback((results: SearchResult[]) => {
  //   dispatch({ type: Types.SET_SEARCH_RESULTS, payload: results });
  // }, []);

  const initTTS = useCallback(() => {
    book.current?.injectJavaScript(`
      reader.view.initTTS();
      reader.setPlaying(true);
    `);
  }, []);
  const startTTS = useCallback(() => {
    book.current?.injectJavaScript(`
      reader.startTTS();
    `);
  }, []);
  const resumeTTS = useCallback(() => {
    book.current?.injectJavaScript(`
      reader.setPlaying(Boolean(true));
      reader.resumeTTS();
    `);
  }, []);
  const nextTTS = useCallback((paused: boolean) => {
    book.current?.injectJavaScript(`
      reader.nextTTS(Boolean(${paused}));
    `);
  }, []);
  const prevTTS = useCallback((paused: boolean) => {
    book.current?.injectJavaScript(`
      reader.view.tts.prev(Boolean(${paused}));
    `);
  }, []);
  const setMarkTTS = useCallback((mark: string) => {
    book.current?.injectJavaScript(`
      reader.view.tts.setMark('${mark}');
    `);
  }, []);
  const pauseTTSMark = useCallback((stopping?: boolean) => {
    const javascript = `reader.setPlaying(false); true;`;
    const fullJavascript =
      javascript +
      (stopping
        ? `
      if (reader.prev){
          reader.view.addAnnotation({
            value: reader.prev,
            color: 'red'
          }, true);
        };
        true;
    `
        : "true;");
    book.current?.injectJavaScript(fullJavascript);
  }, []);

  const setIsPdf = useCallback((isPdf: boolean) => {
    dispatch({ type: Types.SET_IS_PDF, payload: isPdf });
  }, []);

  const setKey = useCallback((key: string) => {
    dispatch({ type: Types.SET_KEY, payload: key });
  }, []);

  const contextValue = useMemo(
    () => ({
      initTTS,
      startTTS,
      resumeTTS,
      nextTTS,
      prevTTS,
      setMarkTTS,
      pauseTTSMark,
      openMenu,
      setAnnotations,
      useMenuAction,
      registerBook,
      // setAtStart,
      // setAtEnd,
      // setTotalLocations,
      setCurrentLocation,
      setMeta,
      // setProgress,
      // setLocations,
      setIsLoading,
      setIsRendering,
      setIsPdf,
      setCover,

      goToLocation,
      goPrevious,
      goNext,
      // getLocations,
      getMeta,
      // search,

      // addMark,
      // removeMark,

      setKey,
      key: state.key,

      changeTheme,
      // changeFontFamily,
      theme: state.theme,

      atStart: state.atStart,
      atEnd: state.atEnd,
      currentLocation: state.currentLocation,
      meta: state.meta,
      progress: state.progress,
      isLoading: state.isLoading,
      isRendering: state.isRendering,
      isPdf: state.isPdf,
      cover: state.cover,
      // setSearchResults,
    }),
    [
      initTTS,
      startTTS,
      resumeTTS,
      nextTTS,
      prevTTS,
      setMarkTTS,
      pauseTTSMark,
      openMenu,
      useMenuAction,
      setAnnotations,
      // addMark,
      // changeFontFamily,
      // changeFontSize,
      changeTheme,
      getMeta,
      // getLocations,
      goNext,
      goPrevious,
      goToLocation,
      registerBook,
      // removeMark,
      // search,
      // setAtEnd,
      // setAtStart,
      setCurrentLocation,
      setMeta,
      setIsLoading,
      setIsRendering,
      setIsPdf,
      setKey,
      setCover,
      // setLocations,
      // setProgress,
      // setSearchResults,
      // setTotalLocations,
      state.atEnd,
      state.atStart,
      state.currentLocation,
      state.meta,
      state.isLoading,
      state.isRendering,
      state.key,
      state.progress,
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
