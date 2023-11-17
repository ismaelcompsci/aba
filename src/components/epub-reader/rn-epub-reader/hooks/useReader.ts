import { useContext } from "react";

import { ReaderContext, ReaderContextProps } from "../context";

export function useReader() {
  const {
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
    // changeFontFamily,
    changeTheme,
    goToLocation,
    goPrevious,
    goNext,
    // getLocations,
    // getCurrentLocation,
    getMeta,
    // search,
    // addMark,
    // removeMark,
    theme,
    // atStart,
    // atEnd,
    // totalLocations,
    currentLocation,
    // progress,
    // locations,
    isLoading,
    isRendering,
    setIsPdf,
    isPdf,
    cover,
    // key,
    // searchResults,
  } = useContext(ReaderContext);

  return {
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
    // changeFontFamily,
    changeTheme,
    goToLocation,
    goPrevious,
    goNext,
    // getLocations,
    // getCurrentLocation,
    getMeta,
    // search,
    // addMark,
    // removeMark,
    theme,
    // atStart,
    // atEnd,
    // totalLocations,
    currentLocation,
    // progress,
    // locations,
    isRendering,
    isLoading,
    isPdf,
    cover,
    // key,
    // searchResults,
    setIsPdf,
  } as Pick<
    ReaderContextProps,
    // | "changeFontFamily"
    | "changeTheme"
    | "goToLocation"
    | "goPrevious"
    | "goNext"
    // | "getLocations"
    // | "getCurrentLocation"
    | "getMeta"
    // | "search"
    // | "addMark"
    // | "removeMark"
    | "theme"
    // | "atStart"
    // | "atEnd"
    // | "totalLocations"
    | "currentLocation"
    // | "progress"
    // | "locations"
    | "isLoading"
    | "isRendering"
    // | "key"
    // | "searchResults"
    | "setIsPdf"
    | "isPdf"
    | "cover"
    | "useMenuAction"
    | "setAnnotations"
    | "openMenu"
    | "initTTS"
    | "startTTS"
    | "nextTTS"
    | "prevTTS"
    | "resumeTTS"
    | "setMarkTTS"
    | "pauseTTSMark"
  >;
}
